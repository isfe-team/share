(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

const addOne = function(x) {
  x = Number(x);
  return Number.isNaN(x)
    ? 0
    : x + 1;
};

/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

console.log('imported addOne from util', addOne);

})));
