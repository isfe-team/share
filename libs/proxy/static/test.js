/*!
 * test proxy
 * bq-hentai | 10/21/2017
 */

var path = require('path')
var createProxyServer = require('.')

var config = {
  port: 10241,
  staticDirectory: path.resolve('./static'),
  ruleConfig: {
    rules: {
      '/account': 'http://172.31.3.148:8768/account'
    },
    default: 'http://localhost:10240'
  }
}

createProxyServer(config, function () {
  console.log('server started')
})
