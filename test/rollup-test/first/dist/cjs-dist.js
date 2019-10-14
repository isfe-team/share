'use strict';

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

var index$1 = 42;

var say = {
    say: function () {
        console.log('Say:', arguments);
    }
};

/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

console.log('imported addOne from util', addOne);
console.log('say me', say.say(me));

var index = function() {
  console.log('the answer is', index$1);
};

module.exports = index;
//# sourceMappingURL=cjs-dist.js.map
