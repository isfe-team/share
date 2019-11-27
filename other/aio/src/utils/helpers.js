/*!
 * A series of **helpers** for common usages
 * bqliu
 * @deps [ ]
 */

;(function (factory) {
  if (typeof module === 'object' && typeof module.export === 'object') {
    module.export = factory()
  } else if (typeof define === 'object' && define.amd) {
    define([ /*...*/ ], factory)
  } else {
    window.helpers = factory()
  }
})(function () {
  /* generate a uniqe id */
  var generateUID = (function () {
    var uid = 0

    return function generateUIDCore (prefix) {
      uid += 1
      return (prefix ? String(prefix) : '') + uid + Date.now()
    }
  })()

  function addClass (el, className) {
    el.classList.add(className)
  }

  function removeClass (el, className) {
    el.classList.remove(className)
  }

  var browserPrefixes = [ 'webkit', 'moz', 'ms', 'o' ]
  function zoomEl (el, zoom, transformOrigin) {
    transformOrigin = transformOrigin || [0, 0]
    var scaleString = 'scale(' + zoom + ')'
    var originString = (transformOrigin[0] * 100) + '% ' + (transformOrigin[1] * 100) + '%'
    var elStyle = el.style

    browserPrefixes.forEach(function (prefix) {
      elStyle[prefix + 'Transform'] = scaleString
      elStyle[prefix + 'TransformOrigin'] = originString
    })

    elStyle.transform = scaleString
    elStyle.transformOrigin = originString
  }

  function zoomJsPlumbInstance (instance, zoom, transformOrigin) {
    zoomEl(instance.getContainer(), zoom, transformOrigin)
    instance.setZoom(zoom)
  }

  return {
    generateUID: generateUID,
    addClass: addClass,
    removeClass: removeClass,
    zoomEl: zoomEl,
    zoomJsPlumbInstance: zoomJsPlumbInstance
  }
})
