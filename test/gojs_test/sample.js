/*!
 * bqliu
 * Key 貌似会自己保证独一无二，哪怕我自己设置了一个
 */

;(function () {
  var makeGraphObject = go.GraphObject.make
  var diagram = window.gDiagram = makeGraphObject(go.Diagram, 'diagram', {
    grid: makeGraphObject(
      go.Panel,
      'Grid',
      makeGraphObject(
        go.Shape,
        'LineH',
        { stroke: 'lightgray', strokeWidth: 0.5 }
      ),
      makeGraphObject(
        go.Shape,
        'LineH',
        { stroke: 'gray', strokeWidth: 0.5, interval: 10 }
      ),
      makeGraphObject(
        go.Shape,
        'LineV',
        { stroke: 'lightgray', strokeWidth: 0.5 }
      ),
      makeGraphObject(
        go.Shape,
        'LineV',
        { stroke: 'gray', strokeWidth: 0.5, interval: 10 }
      )
    ),
    // initialContentAlignment: go.Spot.Center,
    allowDrop: true,  // must be true to accept drops from the Palette
    scrollsPageOnFocus: false,
    // ctrl + z => undo
    'undoManager.isEnabled': true,
    // 'CommandHandler.deleteSelection': false,
    ExternalObjectsDropped: function (evt) {
      evt.subject.each(function (x) {
        console.log('item', x)
      })
    }
  })

  // append node location
  var addNodeLocation = function () {
    return [
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      {
        // the Node.location is at the center of each node
        locationSpot: go.Spot.Center,
        // isShadowed: true,
        // shadowColor: '#888',
        mouseEnter: function (evt, obj) { showPorts(obj.part) },
        mouseLeave: function (evt, obj) { hidePorts(obj.part) }
      }
    ]
  }

  // define `port` util
  var makePort = function (name, spot, fromLinkable, toLinkable) {
    return makeGraphObject(
      go.Shape,
      'Circle',
      {
        fill: 'transparent',
        stroke: null, // when show it, change to 'white'
        desiredSize: new go.Size(8, 8),
        alignment: spot,
        alignmentFocus: spot,
        portId: name,
        fromSpot: spot,
        toSpot: spot,
        fromLinkable: fromLinkable,
        toLinkable: toLinkable,
        cursor: 'pointer'
      }
    )
  }

  // toggle `ports` util
  var togglePorts = function (node, show) {
    var diagram = node.diagram
    if (!diagram || diagram.isReadOnly || !diagram.allowLink) {
      return
    }
    node.ports.each(function (port) {
      port.stroke = (show ? 'coral' : null)
    })
  }

  var showPorts = function (node) { togglePorts(node, true) }
  var hidePorts = function (node) { togglePorts(node, false) }

  // add a `Default` node type
  diagram.nodeTemplateMap.add(
    'Default',
    makeGraphObject(
      go.Node,
      'Spot',
      {
        resizable: true,
        rotatable: true,
        // don't re-layout when node changes size
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        click: function (evt, node) { console.log('node clicked', node.data) },
        doubleClick: function (evt, node) { console.log('node dblclick', node.data) }
      },
      addNodeLocation(),
      // new go.Binding('layerName', 'isHighlighted', function (h) { return h ? 'Foreground' : ''; }).ofObject(),
      makeGraphObject(
        go.Panel,
        'Auto',
        makeGraphObject(
          go.Shape,
          'Rectangle',
          { fill: 'pink', stroke: null }
        ),
        makeGraphObject(
          go.TextBlock,
          'Default text',
          {
            margin: 8,
            maxSize: new go.Size(160, NaN),
            textAlign: 'center',
            wrap: go.TextBlock.WrapFit,
            stroke: 'white',
            font: 'bold 16px sans-serif',
            editable: true // false
          },
          new go.Binding('text', 'name').makeTwoWay()
        )
      ),
      makePort('T', go.Spot.Top, true, true),
      makePort('L', go.Spot.Left, true, true),
      makePort('R', go.Spot.Right, true, true),
      makePort('B', go.Spot.Bottom, true, true)
    )
  )
  // add a `Parallelogram` node type
  diagram.nodeTemplateMap.add(
    'Parallelogram',
    makeGraphObject(
      go.Node,
      'Spot',
      {
        resizable: true,
        rotatable: true,
        // deletable: false,
        // don't re-layout when node changes size
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        click: function (evt, node) { console.log('node clicked', node.data) },
        doubleClick: function (evt, node) { console.log('node dblclick', node.data) }
      },
      addNodeLocation(),
      makeGraphObject(
        go.Panel,
        'Auto',
        makeGraphObject(
          go.Shape,
          'Parallelogram2',
          {
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 2,
            // width: 80,
            // height: 40
          }
        ),
        makeGraphObject(
          go.TextBlock,
          'Default text',
          {
            width: 60,
            margin: 8,
            textAlign: 'center',
            stroke: 'white',
            font: 'bold 12px sans-serif'
          },
          new go.Binding('text', 'name')
        )
      ),
      makePort('T', go.Spot.Top, true, true),
      makePort('L', go.Spot.Left, true, true),
      makePort('R', go.Spot.Right, true, true),
      makePort('B', go.Spot.Bottom, true, true)
    )
  )
  // add a `Default` link type ---- means **default** actually
  diagram.linkTemplateMap.add(
    '',
    makeGraphObject(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5,
        toShortLength: 4,
        relinkableFrom: true,
        relinkableTo: false,
        reshapable: true,
        resegmentable: true,
        // set no deletable
        deletable: false,
        mouseEnter: function () { },
        mouseLeave: function () { }
      },
      makeGraphObject(
        go.Shape,
        { isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HIGHELIGHT' }
      ),
      makeGraphObject(
        go.Shape,
        { isPanelMain: true, strokeWidth: 2, stroke: 'gray' }
      ),
      makeGraphObject(
        go.Shape,
        { toArrow: 'Standard', fill: 'gray', stroke: null }
      ),
      // the link label, normally not visible
      makeGraphObject(
        go.Panel,
        'Auto',
        { visible: false, name: 'LABEL', segmentIndex: 2, segmentFraction: 0.5 },
        new go.Binding('visible', 'labelVisible').makeTwoWay(),
        // the label shape
        makeGraphObject(
          go.Shape,
          'RoundedRectangle',
          { fill: "#F8F8F8", stroke: null }
        ),
        // the label
        makeGraphObject(
          go.TextBlock,
          'Default Label',
          {
            textAlign: 'center',
            font: '10pt helvetica, arial, sans-serif',
            stroke: '#333333',
            editable: false
          },
          new go.Binding('text', 'label').makeTwoWay()
        )
      )
    )
  )

  var model = makeGraphObject(go.Model)
  var linksModel = makeGraphObject(go.GraphLinksModel)
  var treeModel = makeGraphObject(go.TreeModel)

  // define the initial node data
  var nodeDataArray = [{
    category: 'Default',
    key: '0',
    name: 'Alpha-name',
    loc: '0 -50'
  }, {
    category: 'Default',
    key: '1',
    name: 'Beta-name',
    loc: '0 50'
  }, {
    category: 'Default',
    key: '2',
    name: 'Beta-x-name',
    loc: '0 150'
  }, {
    category: 'Parallelogram',
    key: '3',
    name: 'Gamma-name',
    loc: '0 250'
  }]

  // define the initial link data
  var linkDataArray = [{
    from: '0',
    to: '1',
    fromPort: 'B',
    toPort: 'T',
    labelVisible: false
  }, {
    from: '1',
    to: '2',
    fromPort: 'B',
    toPort: 'T',
    labelVisible: true,
    label: 'Label me'
  }, {
    from: '2',
    to: '3',
    fromPort: 'B',
    toPort: 'T',
    labelVisible: true,
    label: 'Haha Label'
  }]

  // initialize the model
  linksModel.nodeDataArray = nodeDataArray
  linksModel.linkDataArray = linkDataArray
  // 初始数据也必须要有 不然就不能更改初始连接
  linksModel.linkFromPortIdProperty = 'fromPort'
  linksModel.linkToPortIdProperty = 'toPort'

  // diagram.layout = makeGraphObject(go.TreeLayout, {
  //   angle: 90,
  //   layerSpacing: 35
  // })

  diagram.model = linksModel

  diagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
  diagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

  diagram.addDiagramListener('Modified', function (evt) {
    console.log('Modified', evt)
  })

  var palette = makeGraphObject(
    go.Palette,
    'palette', // nodeDOM id or nodeDOM ref
    {
      scrollsPageOnFocus: false,
      nodeTemplateMap: diagram.nodeTemplateMap,
      model: new go.GraphLinksModel([
        { category: 'Default' },
        { category: 'Parallelogram' }
      ])
    }
  )

  var trans = function (diagram, transName, fn) {
    diagram.startTransaction(transName)
    fn()
    diagram.commitTransaction(transName)
  }

  // get `Diagrame` data
  var getDiagramData = function (Diagram) {
    return diagram.model.toJSON()
  }

  var appendDiagramData = window.appendDiagramData = function () {
    var data = JSON.parse(getDiagramData())
    console.log('diagram data', data)
    data = JSON.stringify(data, null, 2)
    document.querySelector('#diagram_data').textContent = data
  }

  // setTimeout(function() {
  //   trans(diagram, 'improve', function () {
  //     diagram.model.nodeDataArray.push({
  //       category: 'Parallelogram',
  //       key: 'Release',
  //       name: 'Release-name',
  //     })
  //     diagram.model.linkDataArray.push({
  //       category: 'Default',
  //       from: 'Beta',
  //       to: 'Release'
  //     })
  //     diagram.model.linkDataArray.push({
  //       category: 'Default',
  //       from: 'Release',
  //       to: 'Alpha'
  //     })

  //     diagram.updateAllRelationshipsFromData()
  //   })
  // }, 2000)
})()
