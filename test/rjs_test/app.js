/*!
 * boommmmm
 * bqliu | 08/22/2017
 */

require.config({
  baseUrl: './vendors',
  paths: {
    js: '../js',
    tpls: '../tpls'
  }
})

/** error handler */
require.onError = function onError(error) {
  /** Ignore */
}

/** bootstrap */
require(
  [ 'jquery', 'text!tpls/xo.html', 'js/dep-free-module', 'js/dep-jq-module', 'jquery.template', 'lodash' ],
  function bootstrap($, xoTpl, depFree, depJq, t, _) {

    $(function onReady() {

      depFree.log('Ready, go!')
      $('body').append(xoTpl)

      var tpl = '' +
        '<span class="title-content" data-evdname="${confirm.repeatName}" title="${confirm.repeatName}">${confirm.repeatName}</span>' +
      ''

      var confirm = {
        repeatName: _.escape('<a href="https://www.baidu.com"></a>')
      }

      var $compiled = $.tmpl(tpl, { confirm: confirm })

      console.log('c', $compiled)

      $('body').append($compiled)

      setTimeout(function() {
        require([ 'text!tpls/xo2.html' ], function (x) {
          console.log(x)
        })
      }, 10000)
      depJq.test()
    })
  }
)
