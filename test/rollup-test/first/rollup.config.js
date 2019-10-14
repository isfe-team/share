/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

// rollup.config.js
import amd from 'rollup-plugin-amd';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'index.js',
  format: 'cjs',
  plugins: [
    resolve(),
    amd({
      exclude: [ 'node_modules/**' ]
    })
  ],
  dest: 'dist/cjs-dist.js',
  sourceMap: true
};