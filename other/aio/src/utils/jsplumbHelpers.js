/*!
 * jsplumb helpers
 * bqliu
 * @deps [ jsPlumb, lodash, constants, helpers ]
 */

;(function (factory) {
  if (typeof module === 'object' && typeof module.export === 'object') {
    module.export = factory()
  } else if (typeof define === 'object' && define.amd) {
    define([ /*...*/ ], factory)
  } else {
    window.jsplumbHelpers = factory()
  }
})(function () {
  function getNodeDOMById (jsPlumbInstance, nodeId) {
    return jsPlumbInstance.getContainer().querySelector('#' + nodeId)
  }

  function setNodeNameInDOM (nodeDOM, nodeName) {
    nodeName = nodeName || ''
    var tipDOM = nodeDOM.querySelector('.flow-chart-node-tip-bar')
    if (tipDOM) {
      tipDOM.innerText = nodeName
      tipDOM.setAttribute('title', nodeName)
      if (!nodeName) {
        helpers.addClass(tipDOM, 'flow-chart-node-empty-tip')
      } else {
        helpers.removeClass(tipDOM, 'flow-chart-node-empty-tip')
      }
    }
  }

  function updateNodeDOM (jsPlumbInstance, node) {
    var nodeDOM = getNodeDOMById(jsPlumbInstance, node.nodeId)
    console.log('将要更新的节点', nodeDOM)
    if (nodeDOM) {
      setNodeNameInDOM(nodeDOM, node.nodeName)
    }
  }

  function getNodeTopEndpoint (jsPlumbInstance, nodeId) {
    return jsPlumbInstance.getEndpoint(`${nodeId}::0`)
  }

  function getNodeBottomEndpoint (jsPlumbInstance, nodeId) {
    return jsPlumbInstance.getEndpoint(`${nodeId}::2`)
  }

  // w | h 只能 '100%' 和 '100px' 这样的数据，自行保证合法
  function resizeDOMToFitableSize (el, w, h, dw, dh, fit) {
    fit = !!fit
    if (fit) {
      el.style.width = w || '100%'
      el.style.height = h || '100%'
    }

    if (el.scrollHeight > el.offsetHeight) {
      el.style.height = el.scrollHeight + dh + 'px'
    }

    if (el.scrollWidth > el.offsetWidth) {
      el.style.width = el.scrollWidth + dw + 'px'
    }

    // 不考虑 scrollTop/scrollLeft 了，太麻烦了
    // var elStyle = getComputedStyle(el)
    // var elWidth = parseInt(elStyle.width, 10)
    // var elHeight = parseInt(elStyle.height, 10)

    // var isPercentW = w.indexOf('%') !== -1
    // var compareWidth = isPercentW ? el.parentElement.offsetWidth * (parseInt(w) / 100 ) : w
    // var isPercentH = h.indexOf('%') !== -1
    // var compareHeight = isPercentH ? el.parentElement.offsetHeight * (parseInt(h) / 100) : h

    // // el.style.width = w || '100%'
    // // el.style.height = h || '100%'
    // // force render
    // // el.style.width
    // // recalc 确保在最小边界（尽可能的小）
    // var needToScrollIntoViewX = false
    // var needToScrollIntoViewY = false
    // if (elHeight <= el.scrollHeight) {
    //   // el.style.height = h || '100%'
    //   if (el.scrollHeight > compareHeight) {
    //     needToScrollIntoViewY = triggerEl && triggerEl.offsetTop > el.scrollTop + compareHeight
    //     el.style.height = el.scrollHeight + dh + 'px'
    //     // el.parentElement.scrollTop = el.scrollHeight + dh
    //   }
    // }
    // if (elWidth <= el.scrollWidth) {
    //   // el.style.width = w || '100%'
    //   if (el.scrollWidth > compareWidth) {
    //     needToScrollIntoViewX = triggerEl && triggerEl.offsetLeft > el.scrollLeft + compareWidth
    //     el.style.width = el.scrollWidth + dw + 'px'
    //     // el.parentElement.scrollLeft = el.scrollWidth + dw
    //   }
    // }
    // if (needToScrollIntoViewX) {
    //   el.parentElement.scrollLeft = triggerEl.offsetLeft + triggerEl.offsetWidth + dw
    // }
    // if (needToScrollIntoViewY) {
    //   el.parentElement.scrollTop = triggerEl.offsetTop + triggerEl.offsetHeight + dh
    // }
  }

  function updateGroupContainer (jsPlumbInstance, groupContainer, fit) {
    resizeDOMToFitableSize(groupContainer, '260px', '300px', 20, 20, fit)
    jsPlumbInstance.revalidate(groupContainer)
  }

  function updateGroupContainerByEl (jsPlumbInstance, el, fit) {
    var group = jsPlumbInstance.getGroupFor(el)
    var inGroup = isInGroup(jsPlumbInstance, el)

    if (inGroup) {
      var $groupContainer = group.getEl()
      updateGroupContainer($groupContainer, fit)
    }
  }

  function updateJsplumbContainer (jsPlumbInstance, fit) {
    resizeDOMToFitableSize(jsPlumbInstance.getContainer(), '100%', '100%', 20, 20, fit)
  }

  function getDragOptions (jsPlumbInstance) {
    let initialPos = null
    return {
      // [wiki](https://github.com/jsplumb/katavorio/wiki)
      // containment: contain ? jsPlumbInstance.getContainer() : null,
      // constrain: true,
      start: function () {
        initialPos = null
      },
      drag: function ({ el, pos: [ x, y ] }) {
        if (!initialPos) {
          initialPos = { x, y }
        }
      },
      stop: function ({ el, pos: [ x, y ] }) {
        // TODO 增加 group 内 item 的限制
        var group = jsPlumbInstance.getGroupFor(el)
        var inGroup = isInGroup(jsPlumbInstance, el)

        if (inGroup) {
          // 在 group 内的话，就得判断 x 和 当前 node 的大小关系
          // 左上区域的话就往里面弄
          var $groupContainer = group.getEl()
          var needResize = false
          if (x < 10 && Math.abs(x) < el.offsetWidth) {
            el.style.left = '10px'
            needResize = true
          }
          if (y < 40 && Math.abs(y) < el.offsetHeight) {
            el.style.top = '40px'
            needResize = true
          }

          // 如果还没出去就 resize
          if (!needResize) {
            // 判断右下是否在范围内，基于一个前提 拖拽的内部元素宽度本身就比 group 要小，高度也是一样的关系
            if ((Math.abs(x) > x.offsetWidth && x < el.offsetWidth) || (Math.abs(y) > x.offsetHeight && y < el.offsetHeight)) {
              needResize = true
            }
          }
          function update () {
            updateGroupContainer(jsPlumbInstance, $groupContainer)
            updateJsplumbContainer(jsPlumbInstance)
            jsPlumbInstance.revalidate($groupContainer)
          }
          if (needResize) {
            update()
          } else {
            // 移除范围外，nextTick 执行（因为内部还要迁移 DOM 节点到外部）
            setTimeout(update, 0)
          }
          return
        }

        let needRepaint = false
        if (x < 0) {
          el.style.left = '10px'
          needRepaint = true
        }
        if (y < 0) {
          el.style.top = '10px'
          needRepaint = true
        }

        updateJsplumbContainer(jsPlumbInstance)

        if (needRepaint) {
          // 先 update 再 repaint
          // 直接 repaint 的话值不会变化 recalc = false
          // jsPlumbInstance.updateOffset({ recalc: true, elId: el.id })
          // jsPlumbInstance.repaint(el)
          // [github issue](https://github.com/jsplumb/jsplumb/issues/721)
          // [github issue2](https://github.com/jsplumb/jsplumb/issues/720#issuecomment-373319096)
          jsPlumbInstance.revalidate(el)
        }

        if (x !== initialPos.x || y !== initialPos.y) {
          console.log('node moved')
          jsPlumbInstance.fire(':node_moved')
        }

        initialPos = null
      }
    }
  }

  /** @NOTICE 只能一次用于单个节点的拖动，不然 initialPos 会有问题 */
  function makeDraggable (jsPlumbInstance, nodeDOM) {
    jsPlumbInstance.draggable(nodeDOM, getDragOptions(jsPlumbInstance))
  }

  function initNode (jsPlumbInstance, nodeDOM, options) {
    options = _.assign({
      filterMe: true,
      filter: '.drag-starter',
      isSource: true,
      isTarget: true
    }, options)

    makeDraggable(jsPlumbInstance, nodeDOM)

    var sourceOptions = _.assign(
      { },
      options.filterMe ? { filter: options.filter } : { }
    )

    var targetOptions = _.assign({ allowLoopBack: true })

    options.isSource && jsPlumbInstance.makeSource(nodeDOM, sourceOptions)
    options.isTarget && jsPlumbInstance.makeTarget(nodeDOM, targetOptions)
  }


  function addEndpoint (jsPlumbInstance, nodeDOM, sourceAnchors, targetAnchors, stAnchors, needMakeDraggable) {
    ;[
      { anchors: sourceAnchors || [ ], config: constants.SOURCE_ENDPOINT_CONFIG },
      { anchors: targetAnchors || [ ], config: constants.TARGET_ENDPOINT_CONFIG },
      { anchors: stAnchors || [ ], config: constants.ST_ENDPOINT_CONFIG }
    ].forEach((wrapper) => wrapper.anchors.forEach(
      (anchor, index) => {
        var uuid = nodeDOM.id + '::' + index
        jsPlumbInstance.addEndpoint(nodeDOM, wrapper.config, {
          anchor: anchor, // 'Continuous'
          uuid: uuid
        })
      })
    )
    // 如果是 group，且 makeDraggable 了，会导致悬浮到另外一个 group 上面时，另外一个 group 也会有 hover 图案
    if (needMakeDraggable) {
      makeDraggable(jsPlumbInstance, nodeDOM)
    }
  }

  // 连接两个 endpoint
  function connectEndpoints (jsPlumbInstance, { sourceEndpoint: s, targetEndpoint: t }) {
    return jsPlumbInstance.connect(
      assign({ }, { uuids: [ s.getUuid(), t.getUuid() ] })
    )
  }

  function connectNodes (jsPlumbInstance, option) {
    // const postNodeDOM = jsPlumbInstance.getElement(source).firstElementChild
    var detachable = true // validate
    return jsPlumbInstance.connect(
      { source: option.sourceId, target: option.targetId },
      { detachable } // editable: false
    )
  }

  // 根据 sourceId 和 targetId 找 connection
  function getConnectionsBySourceIdAndTargetId (jsPlumbInstance, sourceId, targetId) {
    jsPlumbInstance.getConnections({ source: sourceId, target: targetId })
  }

  // 更新 node 的 x y 信息
  function updateNodePosition (jsPlumbInstance, node) {
    // 找到 jsPlumb Element，然后赋值其 x y
    var nodeDOM = jsPlumbInstance.getElement(node.nodeId)
    node.x = parseInt(nodeDOM.style.left, 10)
    node.y = parseInt(nodeDOM.style.top, 10)
  }

  function updateNodesPosition (jsPlumbInstance, nodes) {
    if (Array.isArray(nodes)) {
      return nodes.forEach((node) => updateNodePosition(jsPlumbInstance, node))
    }
    Object.keys(nodes).forEach((nodeId) => updateNodePosition(jsPlumbInstance, nodes[nodeId]))
  }

  function syncNodesWithDiagram (jsPlumbInstance, nodes) {
    updateNodesPosition(jsPlumbInstance, nodes)

    var groups = jsPlumbInstance.getGroups()
    groups.forEach(function (group) {
      var members = group.getMembers()
      members.forEach(function (member) {
        var mId= member.id
        var node = nodes[mId]
        if (node) {
          node.refGroupId = group.id
        }
      })
    })
  }

  function createJsPlumbInstance (container, prefix) {
    prefix = prefix || ''

    return jsPlumb.getInstance({
      Anchor: 'Continuous',
      Endpoint: [ 'Dot', { radius: 2 } ],
      // EndpointStyle: { radius: 0 },
      PaintStyle: {
        strokeWidth: 2,
        stroke: '#61B7CF',
        joinstyle: 'round',
        outlineStroke: 'white',
        outlineWidth: 2
      },
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      DropOptions: { hoverClass: 'drag-hover' },
      MaxConnections: -1,
      HoverPaintStyle: {
        strokeWidth: 3,
        stroke: '#216477',
        outlineWidth: 5,
        outlineStroke: 'white'
      },
      // Flowchart | Bezier | StateMachine | Straight
      Connector: [ 'Flowchart', {
        stub: [ 5, 5 ],
        gap: 2,
        cornerRadius: 5,
        alwaysRespectStubs: false,
        events: { click (_) { console.log('clicked', _) } }
      } ],
      ConnectionOverlays: [
        [ 'Arrow', {
          location: 1,
          visible: true,
          width: 11,
          length: 11,
          id: `${prefix}flow_chart_arrow`,
          events: { click () { } }
        } ],
        [ 'Label', {
          location: 0.5,
          label: '', // 'Label',
          id: `${prefix}flow_chart_label`,
          cssClass: `${prefix}flow-chart-label`,
          events: { tap () { console.log('label tapped') } }
        } ]
      ],
      Container: container
    })
  }

  // TODO group 信息完善
  function calcSequenceFlows (jsPlumbInstance) {
    // 获取所有的连接，然后将各个 endpoint 的 uuid 给保留起来
    return jsPlumbInstance.getAllConnections().reduce((acc, connection) => {
      // var sourceEndpoint = connection.endpoints.sourceEndpoint
      // var targetEndpoint = connection.endpoints.targetEndpoint
      var sourceEndpoint = connection.endpoints[0]
      var targetEndpoint = connection.endpoints[1]

      var overlay = connection.getOverlay('flow_chart_label')
      var label = ''
      if (overlay) {
        label = _.unescape(overlay.label)
      }
      acc.push({
        id: connection.id,
        sourceId: connection.sourceId,
        targetId: connection.targetId,
        // sourceEndpointUuid: sourceEndpoint.getUuid(),
        // targetEndpointUuid: targetEndpoint.getUuid(),
        label: label
      })

      return acc
    }, [ ])
  }

  // 获取所有 elId 的 connections
  function getConnectionsOfEl (jsPlumbInstance, elId) {
    var sources = jsPlumbInstance.getConnections({ source: elId, target: '*' })
    var targets = jsPlumbInstance.getConnections({ source: '*', target: elId })

    return _.uniqBy(sources.concat(targets), function (con) { return con.id })
  }

  // 删除 el 的 connections
  function removeConnectionsOfEl (jsPlumbInstance, elId) {
    // const cons = getConnectionsOfEl(jsPlumbInstance, elId)
    // cons.forEach(function (con) {
    //   jsPlumbInstance.deleteConnection(con)
    // })

    jsPlumbInstance.deleteConnectionsForElement(elId)
  }

  // 也可以用 el，目前用的是 id
  // 虽然获取 group 和判断是否在 group 内部需要 double invokes
  // 但是还是为了更可读
  function isInGroup (jsPlumbInstance, id) {
    var el = jsPlumbInstance.getElement(id)
    var group = jsPlumbInstance.getGroupFor(el)
    return !!(group && !el._isJsPlumbGroup)
  }
  function getGroupByElementId (jsPlumbInstance, id) {
    var groups = jsPlumbInstance.getGroups()

    var group = null
    groups.some(function (g) {
      var els = g.getMembers()
      var exist = els.some(function (el) {
        return el.id === id
      })

      group = g
      return exist
    })

    return group
  }

  return {
    addEndpoint: addEndpoint,
    calcSequenceFlows: calcSequenceFlows,
    connectEndpoints: connectEndpoints,
    connectNodes: connectNodes,
    createJsPlumbInstance: createJsPlumbInstance,
    getConnectionsBySourceIdAndTargetId: getConnectionsBySourceIdAndTargetId,
    getConnectionsOfEl: getConnectionsOfEl,
    getDragOptions: getDragOptions,
    getNodeDOMById: getNodeDOMById,
    getNodeTopEndpoint: getNodeTopEndpoint,
    getNodeBottomEndpoint: getNodeBottomEndpoint,
    initNode: initNode,
    isInGroup: isInGroup,
    makeDraggable: makeDraggable,
    setNodeNameInDOM: setNodeNameInDOM,
    updateGroupContainer: updateGroupContainer,
    updateGroupContainerByEl: updateGroupContainerByEl,
    updateJsplumbContainer: updateJsplumbContainer,
    updateNodeDOM: updateNodeDOM,
    syncNodesWithDiagram: syncNodesWithDiagram
  }
})
