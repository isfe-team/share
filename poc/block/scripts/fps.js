/*!
 * fps calculator
 *
 * @ref https://link.zhihu.com/?target=http%3A//taobaofed.org/blog/2016/01/13/measuring-fps/
 */

;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.fpsCalculator = factory())
}(this, (function () {
  'use strict'

  if (typeof performance !== 'object') {
    return
  }

  if (typeof requestAnimationFrame !== 'function') {
    return
  }

  function inArray (xs, x) {
    return xs.indexOf(x) !== -1
  }

  const calculator = {
    _callbacks: [ ],
    _cancelCalculator: null,
    setCallback: function (cb) {
      !inArray(this._callbacks, cb) && this._callbacks.push(cb)
    },
    removeCallback: function (cb) {
      var index = this._callbacks.indexOf(cb)
      if (index !== -1) {
        this._callbacks.splice(index, 1)
      }
    },
    removeAllCallbacks: function () {
      this._callbacks.length = 0
    },
    startCalculate: function () {
      var lastTime = performance.now()
      var frame = 0
      var lastFrameTime = performance.now()

      var calculator = this

      function calc (time) {
        var now = performance.now()
        var fs = (now - lastFrameTime)
        lastFrameTime = now
        var fps = Math.round(1000 / fs)

        console.log(fps)

        frame++

        if (now > 1000 + lastTime) {
          fps = Math.round((frame * 1000) / (now - lastTime))
          frame = 0
          lastTime = now
        }

        var cb = null
        var cbs = calculator._callbacks.slice()
        while (cb = cbs.shift()) {
          cb.call(calculator, fps)
        }

        calculator._cancelCalculator = requestAnimationFrame(calc)
      }

      calc()
    },
    cancelCalculate: function () {
      cancelAnimationFrame(this._cancelCalculator)
    }
  }

  return calculator
})))
