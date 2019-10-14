/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

import { addOne } from './util.js';
import answer from 'the-answer';
import say from './say.js';

console.log('imported addOne from util', addOne);
console.log('say me', say.say(me));

export default function() {
  console.log('the answer is', answer);
}
