/*!
 * build options
 * bqliu | 08/22/2017
 * ref:
 * - [r.js](https://github.com/requirejs/r.js)
 * - [options](http://www.yfznw.com/node/22)
 * - [full.sample](https://github.com/requirejs/r.js/blob/master/build/example.build.js)
 */

({
  baseUrl: './vendors',
  paths: {
    js: '../js',
    tpls: '../tpls'
  },
  // modules: [
  //   {
  //     name: '../../vendor',
  //     include: [ 'vendors' ]
  //   },
  //   {
  //     name: '../../common',
  //     include: [ 'js/dep-free-module' ],
  //     exclue: [ '../../vendor' ]
  //   }
  // ],
  name: '../app',
  // dir: 'dist',
  out: 'dist/app.js',
  // 将模块排除在优化文件之外
  stubModules: [ 'js/dep-free-module' ],
  // 内联所有文本和依赖，避免多次异步请求这些依赖
  inlineText: true,
  generateSourceMaps: true
})
