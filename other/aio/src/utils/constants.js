/*!
 * A series of **CONSTANTS** for flowchart
 * bqliu
 * @deps [ lodash ]
 */

;(function (factory) {
  if (typeof module === 'object' && typeof module.export === 'object') {
    module.export = factory()
  } else if (typeof define === 'object' && define.amd) {
    define([ /*...*/ ], factory)
  } else {
    window.constants = factory()
  }
})(function () {
  var ENDPOINT_PAINT_CONFIG = {
    // stroke: '#7AB02C',
    fill: '#f58',
    radius: 4,
    strokeWidth: 1
  }

  var ENDPOINT_PAINT_HOVER_STYLE = {
    fill: '#216477',
    stroke: '#216477',
    radius: 6
  }

  var CONNECTOR_PAINT_STYLE = {
    strokeWidth: 2,
    stroke: '#61B7CF',
    joinstyle: 'round',
    outlineStroke: 'white',
    outlineWidth: 2
  }

  var CONNECTOR_HOVER_PAINT_STYLE = {
    strokeWidth: 3,
    stroke: '#216477',
    outlineWidth: 5,
    outlineStroke: 'white'
  }

  var BASE_ENDPOINT_CONFIG = {
    endpoint: 'Dot',
    paintStyle: ENDPOINT_PAINT_CONFIG,
    hoverPaintStyle: ENDPOINT_PAINT_HOVER_STYLE,
    maxConnections: -1,
    // Flowchart | Bezier | StateMachine | Straight
    connector: [ 'Flowchart', {
      // curviness: 300,
      stub: [ 5, 5 ],
      gap: 0,
      cornerRadius: 5,
      alwaysRespectStubs: false,
      events: { click: function (_) { console.log('clicked', _) } }
    } ],
    connectorStyle: CONNECTOR_PAINT_STYLE,
    connectorHoverStyle: CONNECTOR_HOVER_PAINT_STYLE,
    dragOptions: { },
    overlays: [
      [ 'Label', {
        location: [ 0.5, 1.5 ],
        label: '', // 注意展开时 visible 貌似会变成 true
        cssClass: 'flow-chart-endpoint-label flow-chart-source-endpoint-label',
        visible: false
      } ]
    ]
  }

  function extendBaseEndpoint () {
    return _.slice(arguments).reduce(function (acc, x) {
      return _.assign(acc, x)
    }, _.assign({ }, BASE_ENDPOINT_CONFIG))
  }

  return {
    SOURCE_ENDPOINT_CONFIG: extendBaseEndpoint({ isSource: true }),
    TARGET_ENDPOINT_CONFIG: extendBaseEndpoint({ isTarget: true, dropOptions: {
      hoverClass: 'flow-chart-endpoint-hover',
      activeClass: 'flow-chart-endpoint-active'
    }}),
    ST_ENDPOINT_CONFIG: extendBaseEndpoint({
      isSource: true,
      isTarget: true
    })
  }
})
