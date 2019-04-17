/*!
 * DocHelper | bqliu
 *
 * 用于语音分析测听界面的 Helpers
 *
 * @todo 优化掉 columnIndices 因为可以从 fullKeywordColumns 导出（目前问题不大）
 * flat(fullKeywordColumns) ====> columnIndices
 * 搜索结果的数据结构需要使用 fullKeywordColumns，因为多个词的话会有问题
 * @todo scrollToCertainWord Optimize Perf of scrollTo
 * @todo 支持多个音频
 *
 * @notice 产品这边延续之前的做法，包括单个词不加下划线，滚动自动滚 30px，注意都标注了 #_
 */

/// <reference path="./type.d.ts" />
// @ts-check

;(function (factory) {
  // @ts-ignore
  if (typeof define === 'function' && define.amd) {
    // @ts-ignore
    define(['art', '$'], factory)
  } else {
    // @ts-ignore
    window.DocHelper = factory(window.template, window.$)
  }
})(function highlightPatchGen (template, $) {
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

  /**
   * @param {Array<any>} xs 
   */
  function last (xs) {
    return xs[xs.length - 1]
  }

  /**
   * @param {string} str 
   */
  function trimAllBlanks (str) {
    return str.replace(/ /g, '')
  }

  /**
   * @param {any} x 
   * @param {any} defaultValue 
   */
  function getDefaultValueIfUndefined (x, defaultValue) {
    if (x === undefined) {
      return defaultValue
    }
    return x
  }

  function DocHelperError (message, code) {
    this.message = message
    this.code = code
  }
  DocHelperError.prototype = {
    constructor: DocHelperError,
    docHelperError: true,
    isDocHelperError: function (error) {
      return error.docHelperError === true
    }
  }

  /**
   * @param {Config} config 
   */
  function DocHelper (config) {
    this.config = config
    this.$list = null
    this.voices = []
    this.prevConfig = []
    this.search = {
      prevSearchedWords: [],
      currentHighlight: null,
      total: 0,
      currentIndex: 0
    }
    this.prev$toScrollOffsetTop = undefined
    // 暂时不检测 _inited 状态
    this._inited = false
  }

  DocHelper.prototype = {
    constructor: DocHelper
  }

  DocHelper.prototype.init = function () {
    // #_
    var channelTpl = ' \
      <% for(var _ = 0; _ < voices.length; ++_) { %> \
        <fieldset class="voice-field"> \
          <legend>流水号 #</legend> \
          <ol class="channels" index="<%= _ %>"> \
            <% for(var i = 0; i < voices[_].length; i++) { %> \
              <li class="channel-wrapper" index="<%= i %>"> \
                <% for(var j = 0; j < voices[_][i].words.length; j++) { %> \
                  <% if (j === 0 && voices[_][i].words[j].length === voices[_][i].channel.length + 2 + 1 || voices[_][i].words[j].length === 1) { %> \
                    <span class="single word" index="<%= i %>"><%= voices[_][i].words[j] %></span> \
                  <% } else { %> \
                    <span class="word" index="<%= j %>"><%= voices[_][i].words[j] %></span> \
                  <% } %> \
                <% } %> \
              </li> \
            <% } %> \
          </ol> \
        </fieldset> \
      <% } %> \
    '

    // '{{each channels}}' +
    //   '<li class="channel-wrapper" index="{{$index}}">' +
    //     '<!--<span class="channel">{{$value.channel}}</span>-->' +
    //     '{{each $value.words}}' +
    //     '<span class="word" index="{{$index}}">{{$value}}</span> ' +
    //     '{{/each}}' +
    //   '</li>' +
    // '{{/each}}'

    var compiledChannelTpl = template.compile(channelTpl)
    this.voices = this.config.dataTransformer(this.config.rawData)
    var HTMLString = compiledChannelTpl({ voices: this.voices })
    this.config.$container.html(HTMLString)
    this.$list = this.config.$container.children()
  }

  /**
   * @param {number} voiceIndex
   * @param {Array<RowIndex>} rows
   */
  DocHelper.prototype.renderHaveBeenReadRows = function (voiceIndex, rows) {
    for (var i = 0, len = rows.length; i < len; ++i) {
      this.renderHaveBeenReadRow(voiceIndex, rows[i])
    }
  }
  /**
   * @param {number} voiceIndex
   * @param {Array<RowIndex>} rows
   */
  DocHelper.prototype.dropHaveBeenReadRows = function (voiceIndex, rows) {
    for (var i = 0, len = rows.length; i < len; ++i) {
      this.dropHaveBeenReadRow(voiceIndex, rows[i])
    }
  }
  /**
   * @param {number} voiceIndex
   * @param {RowIndex} rowIndex
   */
  DocHelper.prototype.renderHaveBeenReadRow = function (voiceIndex, rowIndex) {
    this.$list.eq(voiceIndex).children().eq(1).children().eq(rowIndex).addClass(this.config.css.haveBeenRead)
  }
  /**
   * @param {number} voiceIndex
   * @param {RowIndex} rowIndex
   */
  DocHelper.prototype.dropHaveBeenReadRow = function (voiceIndex, rowIndex) {
    this.$list.eq(voiceIndex).children().eq(1).children().eq(rowIndex).removeClass(this.config.css.haveBeenRead)
  }
  /**
   * @param {number} voiceIndex
   * @param {RowIndex} rowIndex 
   * @param {Array<ColumnIndex>} columns 
   */
  DocHelper.prototype.renderHaveBeenReadColumns = function (voiceIndex, rowIndex, columns) {
    var $children = this.$list.eq(voiceIndex).children().eq(1).children().eq(rowIndex).children()
    for (var i = 0, len = columns.length; i < len; ++i) {
      $children.eq(columns[i]).addClass(this.config.css.haveBeenRead)
    }
  }
  /**
   * @param {number} voiceIndex
   * @param {RowIndex} rowIndex 
   * @param {Array<ColumnIndex>} columns 
   */
  DocHelper.prototype.dropHaveBeenReadColumns = function (voiceIndex, rowIndex, columns) {
    var $children = this.$list.eq(voiceIndex).children().eq(1).children().eq(rowIndex).children()
    for (var i = 0, len = columns.length; i < len; ++i) {
      $children.eq(columns[i]).removeClass(this.config.css.haveBeenRead)
    }
  }

  /**
   * @param {number} voiceIndex
   * @param {Time} time
   * @return {HighlightConfig}
   */
  DocHelper.prototype.getHighlightConfigByTime = function (voiceIndex, time) {
    var channels = this.voices[voiceIndex]
    var haveBeenReadRows = []
    // 其实可以用 索引记录的，但是我目前还是想和 rows 保持一致，用数组，见最上面的注释
    var haveBeenReadColumnsInLastRow = []
    var i = 0, clen = channels.length
    for ( ; i < clen; ++i) {
      haveBeenReadColumnsInLastRow = []
      var found = false
      var times = channels[i].times
      var j = 0, tlen = times.length
      for ( ; j < tlen; ++j) {
        haveBeenReadColumnsInLastRow.push(j)
        var startTime = times[j][0]
        var endTime = times[j][1]
        // @Notice 注意每段话时间是不一定连续的，也就是 [[10, 11], [14, 20]]
        var prevRowIsCorrect = time <= startTime
        // 如果前一个就是对的，比如 12s/5s，就要删除掉前一个
        if (prevRowIsCorrect) {
          haveBeenReadColumnsInLastRow.splice(haveBeenReadColumnsInLastRow.length - 1, 1)
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
    // 防止最后一行都被选中了，此时应该为空数组
    if (i === clen) {
      haveBeenReadColumnsInLastRow = []
    }

    return {
      voiceIndex: voiceIndex,
      channels: channels,
      haveBeenReadRows: haveBeenReadRows,
      haveBeenReadColumnsInLastRow: haveBeenReadColumnsInLastRow
    }
  }

  /**
   * @param {HighlightConfig} highlightConfig
   */
  DocHelper.prototype.renderListByConfig = function (voiceIndex, highlightConfig) {
    this.renderHaveBeenReadRows(voiceIndex, highlightConfig.haveBeenReadRows)
    // 最后要 render 的 columns 的 rowIndex 一定是 haveRead 的最后一个 + 1
    // 如果 rowIndex 是最后一个 就不 render 了
    var rowIndex = getDefaultValueIfUndefined(last(highlightConfig.haveBeenReadRows), -1) + 1
    if (rowIndex === highlightConfig.channels.length) {
      return
    }
    this.renderHaveBeenReadColumns(
      voiceIndex,
      rowIndex,
      highlightConfig.haveBeenReadColumnsInLastRow
    )
  }

  /**
   * simple diff
   * @param {Array<Channel | number>} newList
   * @param {Array<Channel | number>} oldList
   */
  DocHelper.prototype.diffList = function (newList, oldList) {
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

  /**
   * @param {HighlightConfig} newConfig 
   * @param {HighlightConfig} oldConfig
   * @return {HighlightPatch}
   */
  DocHelper.prototype.diff = function (newConfig, oldConfig) {
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
      haveBeenReadColumnsInLastRowPatch = this.diffList(newConfig.haveBeenReadColumnsInLastRow, oldConfig.haveBeenReadColumnsInLastRow)
    }
    return {
      channels: newConfig.channels,
      newMaxRowIndex: newMaxRowIndex,
      oldMaxRowIndex: oldMaxRowIndex,
      // @ts-ignore
      haveBeenReadRowsPatch: this.diffList(newConfig.haveBeenReadRows, oldConfig.haveBeenReadRows),
      // @ts-ignore
      haveBeenReadColumnsInLastRowPatch: haveBeenReadColumnsInLastRowPatch
    }
  }

  /**
   * @param {HighlightPatch} patch
   */
  DocHelper.prototype.applyPatch = function (voiceIndex, patch) {
    log('patch', patch)
    var maxRowLength = patch.channels.length
    // #0 先应用列
    var columnPatch = patch.haveBeenReadColumnsInLastRowPatch
    // #0.1 remove
    var rowIndexOfToBeRemovedColumns = patch.oldMaxRowIndex + 1
    if (rowIndexOfToBeRemovedColumns < maxRowLength) {
      this.dropHaveBeenReadColumns(voiceIndex, rowIndexOfToBeRemovedColumns, columnPatch.removed)
    }
    // #0.2 add
    var rowIndexOfToBeRenderedColumns = patch.newMaxRowIndex + 1
    if (rowIndexOfToBeRenderedColumns < maxRowLength) {
      this.renderHaveBeenReadColumns(voiceIndex, rowIndexOfToBeRenderedColumns, columnPatch.added)
    }
    // #1 再应用行
    var rowPatch = patch.haveBeenReadRowsPatch
    // #1.1 remove
    this.dropHaveBeenReadRows(voiceIndex, rowPatch.removed)
    // #1.2 add
    this.renderHaveBeenReadRows(voiceIndex, rowPatch.added)
  }
  
  /**
   * @param {number} voiceIndex
   * @param {WordPos} wordPos
   * @param {boolean} [scrollToWhenever]
   */
  DocHelper.prototype.scrollToCertainWord = function (voiceIndex, wordPos, scrollToWhenever) {
    var AUTO_SCROLL_DELTA = this.config.scroll.maxScrollDelta
    var MIN_HEIGHT_TO_START_AUTO_SCROLL = this.config.scroll.minHeightToStartAutoScroll
    var $toScroll = this.$list.eq(voiceIndex).children().eq(1).children().eq(wordPos.rowIndex).children().eq(wordPos.columnIndex)
    log('$toScroll', $toScroll)
    if ($toScroll.length === 0) {
      return
    }
    // var offsetTop = $toScroll.get(0).offsetTop
    // @Optimize Perf
    var offParentTop = $toScroll.offset().top
    var needScroll = offParentTop >= MIN_HEIGHT_TO_START_AUTO_SCROLL
    var $container = this.config.$container
    if (scrollToWhenever) {
      $container.scrollTop($toScroll.get(0).offsetTop - MIN_HEIGHT_TO_START_AUTO_SCROLL)
      return
    }
    if (needScroll) {
      $container.scrollTop(this.config.$container.scrollTop() + AUTO_SCROLL_DELTA)
    }
  }
  /**
   * @param {number} voiceIndex
   * @param {WordPos} wordPos
   * @param {number} [delta]
   */
  DocHelper.prototype.scrollDelta = function (voiceIndex, wordPos, delta) {
    delta = getDefaultValueIfUndefined(delta, this.config.scroll.maxScrollDelta)
    var $toScroll = this.$list.eq(voiceIndex).children().eq(1).children().eq(wordPos.rowIndex).children().eq(wordPos.columnIndex)
    // @Optimize Perf
    var offsetTop = $toScroll.get(0).offsetTop
    var $container = this.config.$container
    var scrollTop = $container.scrollTop()
    // 如果和之前 $toScroll 的 offsetTop 一样，说明是同一行的
    // 大于最小的滚动高度 + 滚动的高度
    var needScroll = (this.prev$toScrollOffsetTop !== offsetTop) &&
                     (
                        (offsetTop >= this.config.scroll.minHeightToStartAutoScroll + scrollTop) ||
                        (scrollTop > offsetTop && offsetTop > this.config.scroll.minHeightToStartAutoScroll)
                     )

    if (needScroll) {
      $container.scrollTop(scrollTop + delta)
    }
    this.prev$toScrollOffsetTop = offsetTop
  }
  /**
   * @param {number} voiceIndex
   * @param {HighlightConfig} config
   * @param {boolean} [scrollDelta]
   */
  DocHelper.prototype.scrollToLastHaveBeenReadBottom = function (voiceIndex, config, scrollDelta) {
    var maxRowIndex = getDefaultValueIfUndefined(last(config.haveBeenReadRows), -1)
    var wordPos = null
    if (config.haveBeenReadColumnsInLastRow.length === 0) {
      // 啥都没，应该不会出现
      if (maxRowIndex === -1) {
        return
      }
      var $row = this.$list.eq(voiceIndex).children().eq(1).children().eq(maxRowIndex)
      // length 一定是 > 0 的
      var maxColumnIndex = $row.children().length - 1
      wordPos = { rowIndex: maxRowIndex, columnIndex: maxColumnIndex }
    } else {
      wordPos = {
        rowIndex: maxRowIndex + 1,
        columnIndex: config.haveBeenReadColumnsInLastRow.length - 1
      }
    }
    if (scrollDelta) {
      this.scrollDelta(voiceIndex, wordPos)
      return
    }
    this.scrollToCertainWord(voiceIndex, wordPos, false)
  }

  /**
   * @param {string} keyword
   * @param {Function} cb
   */
  DocHelper.prototype.searchByKeyword = function (keyword, cb) {
    // 先还原之前高亮的
    if (this.search.currentHighlight) {
      this.highlightCertainWord(this.search.currentHighlight, true)
    }
    var trimed = trimAllBlanks(keyword)
    if (!trimed) {
      cb(new DocHelperError('No keyword'))
      return
    }
    var words = this.getWordsByKeyword(trimed)
    var SEARCH_HIGHLIGHT_CLASS = this.config.css.searchHighlight
    this.renderWordsToCertainClass(words, SEARCH_HIGHLIGHT_CLASS)
    var total = 0
    for (var i = 0, wlen = words.length; i < wlen; ++i) {
      total += words[i].fullKeywordColumns.length 
    }
    this.renderWordsToCertainClass(this.search.prevSearchedWords, SEARCH_HIGHLIGHT_CLASS, true)
    this.renderWordsToCertainClass(words, SEARCH_HIGHLIGHT_CLASS)
    var currentIndex = -1
    var currentHighlight = null
    if (words.length > 0) {
      currentHighlight = {
        voiceIndex: words[0].voiceIndex,
        rowIndexInWord: 0,
        columnIndexInWord: 0
      }
      currentIndex = 0
    }
    this.search = {
      currentHighlight: currentHighlight,
      prevSearchedWords: words,
      total: total,
      currentIndex: currentIndex
    }
    if (currentIndex >= 0) {
      this.highlightCertainWord(currentHighlight)
    }
    cb(null, this.search, this)
  }

  /**
   * @param {string} keyword
   * @return {Array<SearchedWordConfig>}
   * @notice keyword 不能为空
   */
  DocHelper.prototype.getWordsByKeyword = function (keyword) {
    var keywordLen = keyword.length
    var reg = new RegExp(keyword, 'g')
    var matchedWords = []
    var voices = this.voices
    for (var _ = 0, vlen = voices.length; _ < vlen; ++_) {
      var channels = voices[_]
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
            voiceIndex: _,
            rowIndex: rowIndex,
            columnIndices: matchedWordsColumnIndices,
            fullKeywordColumns: fullKeywordColumns
          })
        }
      }
    }
    log('matchedWords', matchedWords)
    return matchedWords
  }

  /**
   * 渲染一个词（词组），加上特定的样式，注意一个词可能是多个分词组成的
   * @param {Array<SearchedWordConfig>} words
   * @param {string} className
   * @param {boolean} [remove]
   */
  DocHelper.prototype.renderWordsToCertainClass = function (words, className, remove) {
    if (!className) {
      return
    }
    remove = !!remove
    var cache$list = { }
    var $list = this.$list
    for (var i = 0, wlen = words.length; i < wlen; ++i) {
      var word = words[i]
      var voiceIndex = word.voiceIndex
      if (!cache$list[voiceIndex]) {
        cache$list[voiceIndex] = $list.eq(voiceIndex).children().eq(1).children()
      }
      var $words = cache$list[voiceIndex].eq(word.rowIndex).children()
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
    cache$list = null
  }

  /**
   * 跳转到某个时间
   * @param {Time} time
   */
  DocHelper.prototype.gotoCertainTime = function (voiceIndex, time, scrollDelta) {
    var config = this.getHighlightConfigByTime(voiceIndex, time)
    if (!this.prevConfig[config.voiceIndex]) {
      // @ts-ignore
      this.renderListByConfig(voiceIndex, config)
    } else {
      // @ts-ignore
      var patch = this.diff(config, this.prevConfig[voiceIndex])
      this.applyPatch(voiceIndex, patch)
    }
    this.prevConfig[voiceIndex] = config
    scrollDelta = !!scrollDelta
    // @ts-ignore
    this.scrollToLastHaveBeenReadBottom(voiceIndex, config, scrollDelta)
  }

  /**
   * @param {RowIndex} rowIndexInWord
   * @param {ColumnIndex} columnIndexInWord
   * @param {boolean} prev
   * @return {HightlightWord | null}
   */
  DocHelper.prototype.getSteppedWord = function (rowIndexInWord, columnIndexInWord, prev) {
    var step = !!prev ? -1 : 1
    columnIndexInWord += step

    var prevSearchedWords = this.search.prevSearchedWords

    var word = prevSearchedWords[rowIndexInWord]
    if (columnIndexInWord < 0) {
      if (rowIndexInWord === 0) {
        return null
      }
      rowIndexInWord -= 1
      columnIndexInWord = prevSearchedWords[rowIndexInWord].fullKeywordColumns.length - 1
    } else if (columnIndexInWord === word.fullKeywordColumns.length) {
      if (rowIndexInWord === prevSearchedWords.length - 1) {
        return null
      }
      rowIndexInWord += 1
      columnIndexInWord = 0
    }
    return {
      voiceIndex: prevSearchedWords[rowIndexInWord].voiceIndex,
      rowIndexInWord: rowIndexInWord,
      columnIndexInWord: columnIndexInWord
    }
  }

  /**
   * 跳转到下一个或者上一个
   * @param {StepType} type
   * @param {Function} cb
   */
  DocHelper.prototype.stepTo = function (type, cb) {
    var currentHighlight = this.search.currentHighlight
    if (!currentHighlight) {
      cb(new DocHelperError('无搜索结果，请重新搜索：异常操作，需要先搜索'))
      return
    }
    var isPrev = type === -1
    var highlightWord = this.getSteppedWord(currentHighlight.rowIndexInWord, currentHighlight.columnIndexInWord, isPrev)
    if (!highlightWord) {
      cb(new DocHelperError('没有' + (isPrev ? 'prev' : 'next')))
      return
    }
    this.search.currentIndex += type
    this.highlightCertainWord(this.search.currentHighlight, true)
    this.highlightCertainWord(highlightWord)
    this.search.currentHighlight = highlightWord
    cb(null, this.search, this)
  }

  /**
   * @param {HightlightWord} highlightWord
   * @param {boolean} [prevent]
   */
  DocHelper.prototype.highlightCertainWord = function (highlightWord, prevent) {
    var row = this.search.prevSearchedWords[highlightWord.rowIndexInWord]
    var $words = this.$list.eq(highlightWord.voiceIndex).children().eq(1).children().eq(row.rowIndex).children()
    var words = row.fullKeywordColumns[highlightWord.columnIndexInWord]
    var handler = prevent ? $.prototype.removeClass : $.prototype.addClass
    var HIGHLIGHT_CLASS = this.config.css.emSearchHighlight
    for (var i = 0, wlen = words.length; i < wlen; ++i) {
      handler.call($words.eq(words[i]), HIGHLIGHT_CLASS)
    }
    if (!prevent) {
      this.scrollToCertainWord(highlightWord.voiceIndex, { rowIndex: row.rowIndex, columnIndex: words[0] }, true)
    }
  }

  DocHelper.prototype.isDocHelperError = function (error) {
    return DocHelperError.prototype.isDocHelperError(error)
  }

  Object.keys(DocHelper.prototype).forEach(function (prop) {
    var property = Object.getOwnPropertyDescriptor(DocHelper.prototype, prop)
    var getter = property && property.get
    var plainValue = DocHelper.prototype[prop]
    Object.defineProperty(DocHelper.prototype, prop, {
      get: function () {
        if (typeof plainValue !== 'function' || plainValue === DocHelper) {
          return plainValue
        }
        return function timeWrapper () {
          var timeEnd = time(prop)
          var ret = getter ? getter.apply(this, arguments) : plainValue.apply(this, arguments)
          timeEnd()
          return ret
        }
      }
    })
  })

  return DocHelper
})
