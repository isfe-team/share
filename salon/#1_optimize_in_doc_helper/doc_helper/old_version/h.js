;
// @TODO 搜索结果的数据结构需要重新考虑，现在在 Next 和 Prev 会有问题（多个词的话）
// 优化掉 columnIndices 因为可以从 fullKeywordColumns 导出
// flat(fullKeywordColumns) ====> columnIndices
// 目前问题不大
// @TODO scrollToCertainWord
// @TODO Optimize Perf of scrollTo
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['art'], factory)
  } else {
    window.highlightUtil = factory(window.template)
  }
})(function highlightPatchGen (template) {

  // utils
  function log (label, core) {
    // remove when in production
    console.log(label, core)
  }

  function time (label) {
    console.time(label)
    return function () {
      console.timeEnd(label)
    }
  }

  // 考虑到业务实际情况，不会存在中间 rows 被选择的情况，所可以用一个数字来代替
  // 但是如果存在 中间的被选择，那就需要用 Array<number> 来记录 haveBeenReadRows 和 haveBeenReadColumnsInLastRow
  // 暂时我想保持 patch 中间是 Array<number> 所以暂时使用数组
  var HAVE_BEEN_READ_CLASS = 'red'
  var SEARCH_HIGHLIGHT_CLASS = 'search-rc'
  // 所有的都保留索引
  // interface HighlightConfig {
  //   channels: Array<Channel>,
  //   // 已读过的行数组，整行的
  //   haveBeenReadRows: Array<number>,
  //   // 已读过的列数组，最后读的那行
  //   haveBeenReadColumnsInLastRow: Array<number>,
  //   // 搜索高亮的词组数组 type Tuple = [RowIndex, ColumnIndex]
  //   searchHighlightWords: Array<Tuple>,
  //   // 模型词组数组，暂时不考虑
  //   modelWords: Array<Tuple>
  // }
  // interface HighlightPatch {
  //   channels: Array<Channel>,
  //   newMaxRowIndex: number,
  //   oldMaxRowIndex: number,
  //   haveBeenReadRowsPatch: {
  //     added: Array<number>,
  //     removed: Array<number>
  //   },
  //   haveBeenReadColumnsInLastRowPatch: {
  //     added: Array<Tuple>,
  //     removed: Array<Tuple>
  //   },
  //   searchHighlightWordsPatch: {
  //     add: Array<Tuple>,
  //     remove: Array<Tuple>
  //   }
  // }
  /**
   * @param {Array<number>} rows
   */
  function renderHaveBeenReadRows ($list, rows) {
    for (var i = 0, len = rows.length; i < len; ++i) {
      renderHaveBeenReadRow($list, rows[i])
    }
  }
  function dropHaveBeenReadRows ($list, rows) {
    for (var i = 0, len = rows.length; i < len; ++i) {
      dropHaveBeenReadRow($list, rows[i])
    }
  }
  function renderHaveBeenReadRow ($list, rowIndex) {
    $list.eq(rowIndex).addClass(HAVE_BEEN_READ_CLASS)
  }
  function dropHaveBeenReadRow ($list, rowIndex) {
    $list.eq(rowIndex).removeClass(HAVE_BEEN_READ_CLASS)
  }

  function renderHaveBeenReadColumnsInLastRow ($list, rowIndex, columns) {
    renderHaveBeenReadColumns($list, rowIndex, columns)
  }
  function dropHaveBeenReadColumnsInLastRow ($list, rowIndex, columns) {
    dropHaveBeenReadColumns($list, rowIndex, columns)
  }
  function renderHaveBeenReadColumns ($list, rowIndex, columns) {
    var $children = $list.eq(rowIndex).children()
    for (var i = 0, len = columns.length; i < len; ++i) {
      $children.eq(columns[i]).addClass(HAVE_BEEN_READ_CLASS)
    }
  }
  function dropHaveBeenReadColumns ($list, rowIndex, columns) {
    var $children = $list.eq(rowIndex).children()
    for (var i = 0, len = columns.length; i < len; ++i) {
      $children.eq(columns[i]).removeClass(HAVE_BEEN_READ_CLASS)
    }
  }

  // render To Doc
  var channelTpl = '{{each channels}}' +
    '<li class="channel-wrapper" index="{{$index}}">' +
      '<!--<span class="channel">{{$value.channel}}</span>-->' +
      '{{each $value.words}}' +
      '<span class="word" index="{{$index}}">{{$value}}</span> ' +
      '{{/each}}' +
    '</li>' +
  '{{/each}}'
  var compiledChannelTpl = template.compile(channelTpl)

  // impure
  function transformListData (listData) {
    for (var i = 0, rowLen = listData.length; i < rowLen; ++i) {
      var row = listData[i]
      row.words = row.content.split(' ')
      row.words[0] = row.channel + row.words[0]
      delete row.content
      var times = row.time.split(' ')
      for (var j = 0, tlen = times.length; j < tlen; ++j) {
        var t = times[j].split(',')
        times[j] = [+t[0], +t[1]]
      }
      row.times = times
      delete row.time
    }
    return listData
  }
  function generateChannelsContent (channels) {
    return compiledChannelTpl({ channels: channels })
  }

  function getHighlightConfigByTime (channels, time) {
    var haveBeenReadRows = []
    // 其实可以用 索引记录的，但是我目前还是想和 rows 保持一致，用数组，见最上面的注释
    var haveBeenReadColumnsInLastRow = []
    for (var i = 0, clen = channels.length; i < clen; ++i) {
      haveBeenReadColumnsInLastRow = []
      var found = false
      var times = channels[i].times
      for (var j = 0, tlen = times.length; j < tlen; ++j) {
        haveBeenReadColumnsInLastRow.push(j)
        var startTime = times[j][0]
        var endTime = times[j][1]
        // @Notice 注意每段话时间是不一定连续的
        var prevRowIsCorrect = time <= startTime
        if (prevRowIsCorrect) {
          haveBeenReadColumnsInLastRow.splice(haveBeenReadColumnsInLastRow.length, 1)
        }
        // prevRow || currentRow
        // @Notice 注意是否会存在 time <= endTime 的情况 也就是 startTime 和 endTime 一样的情况
        if (prevRowIsCorrect || (startTime <= time && time < endTime)) {
          found = true
          break
        }
      }
      if (found) {
        break
      }
      haveBeenReadRows.push(i)
    }

    return {
      channels: channels,
      haveBeenReadRows: haveBeenReadRows,
      haveBeenReadColumnsInLastRow: haveBeenReadColumnsInLastRow
    }
  }

  function renderListByConfig ($list, highlightConfig) {
    renderHaveBeenReadRows($list, highlightConfig.haveBeenReadRows)
    // 最后要 render 的 columns 的 rowIndex 一定是 haveRead 的最后一个 + 1
    // 如果 rowIndex 是最后一个 就不 render 了
    var rowIndex = getDefaultValueIfUndefined(last(highlightConfig.haveBeenReadRows), -1) + 1
    if (rowIndex === highlightConfig.channels.length) {
      return
    }
    renderHaveBeenReadColumnsInLastRow(
      $list,
      rowIndex,
      highlightConfig.haveBeenReadColumnsInLastRow
    )
  }

  // simple diff
  function diffList (newList, oldList) {
    var added = []
    var removed = []
    for (var i = 0, len = newList.length; i < len; ++i) {
      var nx = newList[i]
      if (oldList.indexOf(nx) === -1) {
        added.push(nx)
      }
    }
    for (var i = 0, len = oldList.length; i < len; ++i) {
      var ox = oldList[i]
      if (newList.indexOf(ox) === -1) {
        removed.push(ox)
      }
    }
    return { added: added, removed: removed }
  }

  function last (xs) {
    return xs[xs.length - 1]
  }

  function getDefaultValueIfUndefined (x, defaultValue) {
    if (x === undefined) {
      return defaultValue
    }
    return x
  }

  function diff (newConfig, oldConfig) {
    var newMaxRowIndex = getDefaultValueIfUndefined(last(newConfig.haveBeenReadRows), -1)
    var oldMaxRowIndex = getDefaultValueIfUndefined(last(oldConfig.haveBeenReadRows), -1)
    var haveBeenReadColumnsInLastRowPatch = null
    // 只有是一行的才有比较的意义，不然直接不比较，无论是否是 undefined
    var isSameRow = newMaxRowIndex === oldMaxRowIndex
    if (!isSameRow) {
      haveBeenReadColumnsInLastRowPatch = {
        // or `.slice(0)`
        added: newConfig.haveBeenReadColumnsInLastRow,
        removed: oldConfig.haveBeenReadColumnsInLastRow
      }
    } else {
      haveBeenReadColumnsInLastRowPatch = diffList(newConfig.haveBeenReadColumnsInLastRow, oldConfig.haveBeenReadColumnsInLastRow)
    }
    return {
      channels: newConfig.channels,
      newMaxRowIndex: newMaxRowIndex,
      oldMaxRowIndex: oldMaxRowIndex,
      haveBeenReadRowsPatch: diffList(newConfig.haveBeenReadRows, oldConfig.haveBeenReadRows),
      haveBeenReadColumnsInLastRowPatch: haveBeenReadColumnsInLastRowPatch
    }
  }

  function applyPatch ($list, patch) {
    log('patch', patch)
    var maxRowLength = patch.channels.length
    // #0 先应用列
    var columnPatch = patch.haveBeenReadColumnsInLastRowPatch
    // #0.1 remove
    var rowIndexOfToBeRemovedColumns = patch.oldMaxRowIndex + 1
    if (rowIndexOfToBeRemovedColumns < maxRowLength) {
      dropHaveBeenReadColumnsInLastRow($list, rowIndexOfToBeRemovedColumns, columnPatch.removed)
    }
    // #0.2 add
    var rowIndexOfToBeRenderedColumns = patch.newMaxRowIndex + 1
    if (rowIndexOfToBeRenderedColumns < maxRowLength) {
      renderHaveBeenReadColumnsInLastRow($list, rowIndexOfToBeRenderedColumns, columnPatch.added)
    }
    // #1 再应用行
    var rowPatch = patch.haveBeenReadRowsPatch
    // #1.1 remove
    dropHaveBeenReadRows($list, rowPatch.removed)
    // #1.2 add
    renderHaveBeenReadRows($list, rowPatch.added)
  }

  var AUTO_SCROLL_DELTA = 30
  var MIN_HEIGHT_TO_START_AUTO_SCROLL = 200
  // interface WordPos { rowIndex: number, columnIndex: number }
  function scrollToCertainWord ($list, wordPos, scrollToWhenever) {
    var $toScroll = $list.eq(wordPos.rowIndex).children().eq(wordPos.columnIndex)
    log('$toScroll', $toScroll)
    // var offsetTop = $toScroll.get(0).offsetTop
    if ($toScroll.length === 0) {
      return
    }
    // @Optimize Perf
    var offParentTop = $toScroll.offset().top
    var needScroll = offParentTop >= MIN_HEIGHT_TO_START_AUTO_SCROLL
    if (scrollToWhenever) {
      $listWrapper.scrollTop($toScroll.get(0).offsetTop - MIN_HEIGHT_TO_START_AUTO_SCROLL)
      return
    }
    if (needScroll) {
      $listWrapper.scrollTop($listWrapper.scrollTop() + AUTO_SCROLL_DELTA)
    }
    // 下面的方法还是很慢
    // var topTimer = time('top')
    // var toScrollDOM = $toScroll.get(0)
    // if (!toScrollDOM) {
    //   throw new Error('数据异常')
    // }
    // var listDOM = $list.get(0)
    // var toScrollDOMOffsetTop = toScrollDOM.offsetTop
    // var listWrapperDOMScrollTop = listDOM.parentElement.scrollTop
    // // 可能为正，可能为负
    // var delta = toScrollDOMOffsetTop - listWrapperDOMScrollTop
    // var needScroll = (scrollWhenMinusDelta && delta < 0) || delta >= MIN_HEIGHT_TO_START_AUTO_SCROLL
    // topTimer()
    // if (needScroll) {
    //   var parentTimer = time('parent')
    //   var $listWrapper = $list.parent()
    //   parentTimer()
    //   var scrollTimer = time('scroll')
    //   var scrollTop = 0
    //   if (delta > 0) {
    //     scrollTop = listWrapperDOMScrollTop + Math.floor((delta - MIN_HEIGHT_TO_START_AUTO_SCROLL) / AUTO_SCROLL_DELTA) * AUTO_SCROLL_DELTA
    //   } else {
    //     scrollTop = toScrollDOMOffsetTop - MIN_HEIGHT_TO_START_AUTO_SCROLL
    //   }
    //   $listWrapper.scrollTop(scrollTop)
    //   scrollTimer()
    // }
  }
  function scrollToLastHaveBeenReadBottom ($list, config) {
    var maxRowIndex = getDefaultValueIfUndefined(last(config.haveBeenReadRows), -1)
    if (config.haveBeenReadColumnsInLastRow.length === 0) {
      // 啥都没，应该不会出现
      if (maxRowIndex === -1) {
        return
      }
      var $row = $list.eq(maxRowIndex)
      // length 一定是 > 0 的
      var maxColumnIndex = $row.children().length - 1
      scrollToCertainWord($list, { rowIndex: maxRowIndex, columnIndex: maxColumnIndex }, false)
    } else {
      scrollToCertainWord($list, {
        rowIndex: maxRowIndex + 1,
        columnIndex: config.haveBeenReadColumnsInLastRow.length - 1
      }, false)
    }
  }

  function trimAllBlanks (str) {
    return str.replace(/ /g, '')
  }

  function search ($list, channels, keyword) {
    var trimed = trimAllBlanks(keyword)
    if (!trimed) {
      log('keyword', 'No keyword')
      return
    }
    var words = getWordsByKeyword(channels, trimed)
    renderWordsToCertainClass($list, words, SEARCH_HIGHLIGHT_CLASS)
  }

  // @Notice keyword 不能为空
  function getWordsByKeyword (channels, keyword) {
    var keywordLen = keyword.length
    var reg = new RegExp(keyword, 'g')
    var matchedWords = []
    for (var rowIndex = 0, clen = channels.length; rowIndex < clen; ++rowIndex) {
      var channel = channels[rowIndex]
      var words = channel.words
      var wordBounds = []
      var prevTotalWordLength = 0
      for (var columnIndex = 0, wlen = words.length; columnIndex < wlen; ++columnIndex) {
        var wordLen = words[columnIndex].length
        // 为了方便，脑子转不过来了
        wordBounds.push([prevTotalWordLength, prevTotalWordLength + wordLen - 1])
        prevTotalWordLength += wordLen
      }
      var totalWords = words.join('')
      var matched = null
      var matchedWordIndices = []
      while (matched = reg.exec(totalWords)) {
        // 左边界索引
        var wordIndex = matched.index
        matchedWordIndices.push(wordIndex)
      }
      var matchedWordsColumnIndices = []
      var fullKeywordColumns = []
      for (var i = 0, mlen = matchedWordIndices.length; i < mlen; ++i) {
        var columns = []
        var leftBound = matchedWordIndices[i]
        var rightBound = leftBound + keywordLen - 1
        var leftInBound = false
        var rightInBound = false
        var leftBoundIndex = -1
        var rightBoundIndex = -1
        for (var columnIndex = 0, blen = wordBounds.length; columnIndex < blen; ++columnIndex) {
          var bound = wordBounds[columnIndex]
          if (!leftInBound) {
            leftInBound = leftBound >= bound[0] && leftBound <= bound[1]
            if (leftInBound) {
              leftBoundIndex = columnIndex
            }
          }
          if (!rightInBound) {
            rightInBound = rightBound >= bound[0] && rightBound <= bound[1]
            if (rightInBound) {
              rightBoundIndex = columnIndex
            }
          }
          if (leftInBound && rightInBound) {
            break
          }
        }
        // 左边界 >= 0 右边界肯定 >= 0
        if (leftBoundIndex >= 0) {
          for (var bindex = leftBoundIndex; bindex <= rightBoundIndex; ++bindex) {
            matchedWordsColumnIndices.push(bindex)
            columns.push(bindex)
          }
          fullKeywordColumns.push(columns)
        }
      }
      if (matchedWordsColumnIndices.length > 0) {
        matchedWords.push({
          rowIndex: rowIndex,
          columnIndices: matchedWordsColumnIndices,
          fullKeywordColumns: fullKeywordColumns
        })
      }
    }
    log('matchedWords', matchedWords)
    return matchedWords
  }

  // type Word = { rowIndex: number, columnIndices: Array<number>, fullKeywordColumns: Array<Array<number>> }
  // type Words = Array<Word>
  function renderWordsToCertainClass ($list, words, className, remove) {
    if (!className) {
      return
    }
    remove = !!remove
    for (var i = 0, wlen = words.length; i < wlen; ++i) {
      var word = words[i]
      var $words = $list.eq(word.rowIndex).children()
      var columnIndices = word.columnIndices
      for (var j = 0, clen = columnIndices.length; j < clen; ++j) {
        var $word = $words.eq(columnIndices[j])
        if (remove) {
          $word.removeClass(className)
        } else {
          $word.addClass(className)
        }
      }
    }
  }

  var _exports = {
    transformListData: transformListData,
    generateChannelsContent: generateChannelsContent,
    getHighlightConfigByTime: getHighlightConfigByTime,
    renderListByConfig: renderListByConfig,
    diff: diff,
    applyPatch: applyPatch,
    scrollToCertainWord: scrollToCertainWord,
    scrollToLastHaveBeenReadBottom: scrollToLastHaveBeenReadBottom,
    search: search,
    renderWordsToCertainClass: renderWordsToCertainClass,
    getWordsByKeyword: getWordsByKeyword,
    trimAllBlanks: trimAllBlanks,
    SEARCH_HIGHLIGHT_CLASS: SEARCH_HIGHLIGHT_CLASS,
    HAVE_BEEN_READ_CLASS: HAVE_BEEN_READ_CLASS
  }

  Object.keys(_exports).forEach(function (prop) {
    var property = Object.getOwnPropertyDescriptor(_exports, prop)
    var getter = property && property.get
    var plainValue = _exports[prop]
    Object.defineProperty(_exports, prop, {
      get: function () {
        if (typeof plainValue !== 'function') {
          return plainValue
        }
        return function timeWrapper () {
          var timeEnd = time(prop)
          var ret = getter ? getter.apply(_exports, arguments) : plainValue.apply(_exports, arguments)
          timeEnd()
          return ret
        }
      }
    })
  })

  return _exports
})
