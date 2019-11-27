/*!
 * bqliu
 * flow chart entry
 * @deps [ helpers, constants, jsplumbHelpers ]
 * TODOS:
 * - [x] 数据结构设计
 * - [x] save datad
 * - [x] render from data
 * - [x] clearDiagram
 * - [x] dispose zoom drag
 * - [ ] 原有数据集合做适配，做到尽可能少的改变
 * - [ ] 样式调整
 * - [ ] ToolTip 支持
 * - [ ] 拖拽生成节点支持
 * - [ ] validate
 *   - [x] 节点拖拽区域的变更
 *   - [x] 节点、group 不能连接自身
 *   - [x] group 内的节点拖动结束需要能重置好 group 的大小和位置以及拖动的节点的位置
 *   - [x] 节点拖出 group 时需要能删除所有和它相关的连接
 *   - [x] 节点拖进 group 时需要能删除所有和它相关的连接
 *   - [x] group 内的节点间能互相连接，但是不能连接到任何该 group 外的节点（包括其它 group） 内的
 *   - [x] group 外的节点不能连接任何 group 内部的节点
 *   - [x] group 不能连接到 group 内部的节点
 *   - [ ] 发布时不能存在单独的节点（没有任何连接的）（无论 group 外还是 group 内）（group 内只有一个节点的情况除外）
 *   - [ ] 最好的是不能出现闭环
 */

// {
//   "nodes": [
//       {
//         "nodeId": "", // string
//         "nodeType": "", // string    'node' | 'group'
//         "nodeSubType": "", // string 'start' | ''
//         "nodeName": "", // string
//         "refGroupId": "", // string 所在的 group 的 id，和 nodeId 也有对应的
//         "x": "", // string
//         "y": "", // string
//         // 上面的信息都是和流程图直接关联，下面的 nodeInfo 作为 payload 的存在
//         "nodeInfo": { } // any 节点保存的信息，比如和应用关联的
//       }
//     ],
//     // sequenceFlows 代表连线，因为在开发时会存在没有连线的情况
//     "sequenceFlows": [
//       {
//         "id": "", // string
//         "sourceId": "", // string sourceNodeId 和 nodeId 会有对应
//         "targetId": "", // string targetNodeId 和 nodeId 会有对应
//         // 如果考虑确定的锚点位置 还有其它的 uuid，不过主要是和流程图生成有关，和业务映射无关
//         "sourceUUID": "",
//         "targetUUID": ""
//       }
//     ]
//   }
// }

;(function () {
  var $ = document.querySelector.bind(document)
  var $container = $('#flow_chart_diagram')
  var flowChart = window.flowChart = jsplumbHelpers.createJsPlumbInstance($container)

  function showTip (msg) {
    alert(msg)
  }

  /** @api 通过 id 删除节点 */
  function deleteNodeById (jsPlumbInstance, nodeId) {
    // validate
    jsPlumbInstance.remove(nodeId)
    // 处理 node 缓存
    delete nodes[nodeId]
  }
  /** @api 清空图内节点等 */
  function clearDiagram (jsPlumbInstance) {
    try {
      Object.keys(nodes).forEach(function (nodeId)  {
        // 由于有些节点的删除会引起后续节点的删除，所以此时 this.nodes[nodeId] 可能会不存在
        var node = nodes[nodeId]
        if (node) {
          if (node.nodeType === 'node') {
            deleteNodeById(jsPlumbInstance, nodeId)
          } else if (node.nodeType === 'group') {
            // 不移除 members
            jsPlumbInstance.removeGroup(node.nodeId, false)
          }
        }
      })
      nodes = { }
      // 防止不彻底
      flowChart.clear()
      ;[].slice.call($container.children).forEach(function (dom) { dom.remove() })
    } catch (ex) { /* Ignore */ }
  }

  /** @api 根据数据渲染图 */
  function renderFlowChart (jsPlumbInstance, flowChartInfo) {
    // render nodes
    // 先创建 groups，因为还需要塞成员
    flowChartInfo.nodes.filter(function (node) {
      return node.nodeType === 'group'
    }).forEach(function (node) {
      createGroup(jsPlumbInstance, node)
    })
    flowChartInfo.nodes.filter(function (node) {
      return node.nodeType === 'node'
    }).forEach(function (node) {
      createNode(jsPlumbInstance, node)
      if (node.refGroupId) {
        var group = jsPlumbInstance.getGroup(node.refGroupId)
        if (group) {
          group.add(jsPlumbInstance.getElement(node.nodeId))
        } else {
          showTip('数据错误')
        }
      }
    })
    // render sequenceFlows
    flowChartInfo.sequenceFlows.forEach(({ sourceId, targetId, label }) => {
      jsplumbHelpers.connectNodes(flowChart, { sourceId, targetId })
        // .getOverlay('flow_chart_label').setLabel(_.escape(label))
    })

    // fit group 和 diagrame
    jsPlumbInstance.getGroups().forEach(function (group) {
      jsplumbHelpers.updateGroupContainer(flowChart, group.getEl(), true)
    })

    jsplumbHelpers.updateJsplumbContainer(flowChart, true)
  }

  /** fit/del/collapse/node-icon-close 等事件委托 */
  flowChart.on($container, 'click', '.flow-chart-group-opr-fit', function () {
    var groupId = this.parentElement.parentElement.parentElement.id
    var group = flowChart.getGroupFor(groupId)
    if (group) {
      jsplumbHelpers.updateGroupContainer(flowChart, group.getEl(), true)
    }
  })

  flowChart.on($container, 'click', '.flow-chart-group-opr-del', function () {
    const groupId = this.parentElement.parentElement.parentElement.id
    flowChart.removeGroup(groupId, false)
    delete nodes[groupId]
  })

  flowChart.on($container, 'click', '.flow-chart-group-opr-collapse', function () {
    const $group = this.parentElement.parentElement.parentElement
    const groupId = $group.id
    const collapsed = flowChart.hasClass($group, 'jtk-group-collapsed')
    if (collapsed) {
      flowChart.expandGroup(groupId)
      return
    }
    flowChart.collapseGroup(groupId)
  })

  flowChart.on($container, 'click', '.flow-chart-node-icon-close', function (evt) {
    var $node = this.parentElement.parentElement
    var nodeId = $node.id
    var group = flowChart.getGroupFor(nodeId)
    if (group) {
      group.remove($node)
    }
    deleteNodeById(flowChart, nodeId)
    if (group) {
      var $groupContainer = group.getEl()
      jsplumbHelpers.updateGroupContainer($groupContainer)
      flowChart.revalidate($groupContainer)
    }
  })

  /** 连接 dblclick 删除 */
  flowChart.bind('dblclick', (connection, originalEvent) => {
    flowChart.deleteConnection(connection)
  })

  /** 节点 moved 事件处理，这个是我自定义的事件 */
  flowChart.bind(':node_moved', (event) => {
    // ...
  })

  /** group 进入和移除的处理 */
  flowChart.bind('group:addMember', removeConnectionsOfEl)
  flowChart.bind('group:removeMember', removeConnectionsOfEl)

  function removeConnectionsOfEl (evt) {
    flowChart.deleteConnectionsForElement(evt.el)
  }

  /** 连接时校验 */
  flowChart.bind('connection', (evt, originalEvent) => {
    const connection = evt.connection
    if (connection.sourceId === connection.targetId) {
      showTip('不能连接自己')
      flowChart.deleteConnection(connection)
      return
    }
    // group 内的节点不能连到外部
    // group 外部的节点不能连到内部
    var sourceInGroup = jsplumbHelpers.isInGroup(flowChart, connection.source)
    var targetInGroup = jsplumbHelpers.isInGroup(flowChart, connection.target)
    // 都不在 group 那就 ok
    if (!sourceInGroup && !targetInGroup) {
      return
    }
    // 都在 group 需要判断 group 是否一样，一样的也 ok
    // group 不能连接到内部的 node，一并在这里判断
    var sourceGroup = flowChart.getGroupFor(connection.source)
    var targetGroup = flowChart.getGroupFor(connection.target)
    if ((sourceInGroup && targetInGroup) && (sourceGroup === targetGroup)) {
      return
    }
    // 其余情况，都直接删除，并提示一下
    showTip('连接不合法')
    flowChart.deleteConnection(connection)
  })

  flowChart.bind('connectionDragStop', (connection, originalEvent) => {
    /** */
  })

  /** 节点信息存储（注意 group 其实也是 node，只是 nodeType 不同 */
  var nodes = { }

  /**
   * @api 创建节点
   * @param {Object} node
   * @param {string|number} node.nodeId uid of node
   * @param {string} node.nodeType type of node
   * @param {string} node.nodeName name of node
   * @param {string|number} node.x posX of node
   * @param {string|number} node.y posY of node
   * @param {Array} node.sourceAnchors
   * @param {Array} node.targetAnchors
   * @param {Array} node.stAnchors which can be source and target
   * @param {any} node.nodeInfo payload of node
   * @param {boolean} [node.cannotDelete=false]
   */
  function createNode (jsPlumbInstance, node) {
    node = _.defaults(node, {
      nodeId: helpers.generateUID('flow_chart_node_'),
      nodeType: 'node',
      nodeSubType: '',
      nodeName: '默认',
      x: '20',
      y: '20',
      refGroupId: '',
      sourceAnchors: [ ],
      targetAnchors: [ ],
      stAnchors: [ [ 0.5, 0 ], [ 0, 0.5 ], [ 0.5, 1 ], [ 1, 0.5 ] ],
      nodeInfo: { },
      cannotDelete: false
    })

    var div = document.createElement('div')
    div.id = node.nodeId
    div.style.left = node.x + 'px'
    div.style.top = node.y + 'px'
    helpers.addClass(div, 'flow-chart-node-wrapper')

    nodeCoreHTML = '' +
      '<div class="flow-chart-node">' +
        '<i class="flow-chart-node-icon-close">x</i>' +
        '<div class="drag-starter"></div>' +
        '<div class="flow-chart-node-tip-bar"></div>'
      '</div>'

    div.innerHTML = nodeCoreHTML
    if (node.cannotDelete) {
      div.querySelector('.flow-chart-icon-close').remove()
    }

    helpers.addClass(div, 'flow-chart-node-' + node.nodeType)
    jsplumbHelpers.setNodeNameInDOM(div, node.nodeName)

    jsPlumbInstance.getContainer().append(div)
    // jsplumbHelpers.addEndpoint(jsPlumbInstance, div, node.sourceAnchors, node.targetAnchors, node.stAnchors, true)
    jsplumbHelpers.initNode(jsPlumbInstance, div)

    nodes[div.id] = node
    return div
  }

  /** @api 创建 group */
  function createGroup (jsPlumbInstance, node) {
    node = _.defaults(node, {
      nodeId: helpers.generateUID('flow_chart_group_'),
      nodeType: 'group',
      nodeSubType: '',
      x: '20',
      y: '20',
      stAnchors: [ [ 0.5, 0 ], [ 0, 0.5 ], [ 0.5, 1 ], [ 1, 0.5 ] ],
      nodeInfo: { },
      deletable: false
    })

    nodes[node.nodeId] = node

    const div = document.createElement('div')
    helpers.addClass(div, 'flow-chart-group')

    div.innerHTML = '' +
      '<div class="flow-chart-group-header">' +
        '<div class="flow-chart-group-title"></div>' +
        '<div class="flow-chart-group-oprs">' +
          '<div class="flow-chart-group-opr flow-chart-group-opr-fit"></div>' +
          '<div class="flow-chart-group-opr flow-chart-group-opr-collapse"></div>' +
          '<div class="flow-chart-group-opr flow-chart-group-opr-del"></div>' +
        '</div>' +
      '</div>' +
      '<div class="flow-chart-group-content"></div>'

    div.id = node.nodeId
    div.style.left = node.x + 'px'
    div.style.top = node.y + 'px'

    jsPlumbInstance.getContainer().append(div)
    jsplumbHelpers.addEndpoint(jsPlumbInstance, div, [], [], node.stAnchors, false)
    jsPlumbInstance.addGroup({
      el: div,
      id: node.nodeId,
      draggable: true,
      dragOptions: jsplumbHelpers.getDragOptions(flowChart),
      droppable: true,
      proxied: true,
      collapsed: false,
      constrain: false,
      revert: false,
      orphan: true
      // endpoint:[ 'Dot', { radius:3 } ]
    })
  }

  /** 图 ready 之后的处理，暂时只是 drag 和 zoom 处理 */
  flowChart.bind('ready', function () {
    /** enable zoom & drag */
    var noop = function () { }
    var initialZoom = 1
    var zoomDelta = 0.1
    var minZoom = 0.2
    var maxZoom = 4
    var beforeZoom = noop
    var afterZoom = function (zoom) {
      flowChart.setZoom(zoom)
    }
    var currentZoom = initialZoom
    var isMoving = false

    var $flowChartContainer = flowChart.getContainer()
    var $zoomWrapper = $flowChartContainer.parentElement

    function setZoom (zoom) {
      zoom = zoom === undefined ? initialZoom : zoom
      beforeZoom(zoom)
      helpers.zoomEl($flowChartContainer, zoom)
      afterZoom(zoom)
    }

    function move (dx, dy) {
      dx = dx || 0
      dy = dy || 0
      // 方向相反
      $zoomWrapper.scrollLeft += -1 * dx
      $zoomWrapper.scrollTop += -1 * dy
    }

    function handleWheel (evt) {
      // alt
      if (!evt.altKey) {
        return
      }
      evt.preventDefault()
      evt.stopPropagation()
      var wheelDeltaY = evt.wheelDeltaY
      var lZoomDelta = 0
      var needZoom = true
      if (wheelDeltaY < 0 && currentZoom > minZoom) {
        lZoomDelta = -1 * zoomDelta
      } else if (wheelDeltaY > 0 && currentZoom < maxZoom) {
        lZoomDelta = zoomDelta
      } else {
        needZoom = false
      }
      if (!needZoom) {
        console.log('不能再缩放啦')
        return
      }
      currentZoom += lZoomDelta
      setZoom(currentZoom)
    }

    function handleMouseDown (evt) {
      var currentPosition = { pageX: evt.pageX, pageY: evt.pageY }
      var $html = document.documentElement

      function mouseMoveHandler (evt) {
        if (!isMoving) {
          helpers.addClass(document.body, 'user-select-defeat')
        }
        isMoving = true
        helpers.addClass($zoomWrapper, 'moving')
        var deltaX = evt.movementX || evt.pageX - currentPosition.pageX
        var deltaY = evt.movementY || evt.pageY - currentPosition.pageY
        currentPosition = { pageX: evt.pageX, pageY: evt.pageY }

        move(deltaX, deltaY)
      }

      function mouseUpHandler () {
        isMoving = false
        helpers.removeClass(document.body, 'user-select-defeat')
        $html.removeEventListener('mousemove', mouseMoveHandler)
        $html.removeEventListener('mouseup', mouseUpHandler)
      }

      $html.addEventListener('mousemove', mouseMoveHandler)
      $html.addEventListener('mouseup', mouseUpHandler)
    }

    function init () {
      $zoomWrapper.addEventListener('mousedown', handleMouseDown)
      $zoomWrapper.addEventListener('mousewheel', handleWheel)
      // $flowChartContainer.addEventListener('mousedown', evt => evt.stopPropagation)
    }

    init()

    function dispose () {
      $zoomWrapper.removeEventListener('mousedown', handleMouseDown)
      $zoomWrapper.removeEventListener('mousewheel', handleWheel)
    }
  })

  /** 下面几个是演示 demo 内的几个入口 */
  $('#add_node').addEventListener('click', function () {
    createNode(flowChart, { nodeName: '1' })
  })

  $('#add_group').addEventListener('click', function () {
    createGroup(flowChart, { nodeName: '2' })
  })

  $('#fit_diagram').addEventListener('click', function () {
    jsplumbHelpers.updateJsplumbContainer(flowChart, true)
  })

  $('#get_diagram_data').addEventListener('click', function () {
    jsplumbHelpers.syncNodesWithDiagram(flowChart, nodes)
    var sequenceFlows = jsplumbHelpers.calcSequenceFlows(flowChart)

    $('#raw_data').value = JSON.stringify({
      nodes: Object.keys(nodes).reduce(function (acc, key) {
        return acc.concat(nodes[key])
      }, [ ]),
      sequenceFlows: sequenceFlows
    })
  })

  $('#restore_by_data').addEventListener('click', function () {
    clearDiagram(flowChart)
    try {
      var data = JSON.parse($('#raw_data').value)
      renderFlowChart(flowChart, data)
    } catch (e) {
      showTip('格式错误')
    }
  })
})()
