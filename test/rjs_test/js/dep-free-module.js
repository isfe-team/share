/*!
 * a sample module
 * bqliu | 08/22/2017
 */

;define(function () {
  return {
    log: (function getLogger() {
      return typeof console === 'object'
        ? console.log.bind(console)
        : function noop() { }
    })()
  }
})
