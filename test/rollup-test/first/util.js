/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

export const addOne = function(x) {
  x = Number(x);
  return Number.isNaN(x)
    ? 0
    : x + 1;
}

export const dummy = function() {

}

export default {
  addOne,
  dummy
}
