/*!
 * test rollup
 * bq-hentai | 06/28/2017
 */

// rollup.config.js
import amd from 'rollup-plugin-amd';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'pdf-previewer',
  plugins: [
    resolve(),
    amd({
      include: 'src/**',
      exclude: [ 'node_modules/**' ]
    })
  ],
  dest: 'dist/pdf-previewer-umd.js',
  sourceMap: true
};