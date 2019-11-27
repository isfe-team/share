/*!
 * make proxy
 * bq-hentai | 10/21/2017
 * todos
 *   - [ ] support `pathRewrite`
 *   - [x] support `static` files [ like static file server ]
 *   - [x] basic static
 */

var fs = require('fs')
var path = require('path')
var http = require('http')
var url$ = require('url')
var staticMaker = require('node-static')
var httpProxy = require('http-proxy')
var HttpProxyRules = require('http-proxy-rules')
var mime = require('mime')

var STATIC = 'static'
var STATIC_INDEX = ('/' + STATIC).length

var defaultConfig = {
  projectRootPath: '',
  port: 10240,
  // staticDirectory: ''
  ruleConfig: { }
}

// {
//   rules: {
//     '.*/test': 'http://localhost:8080/cool',
//     '.*/test2/': 'http://localhost:8080/cool2/',
//     '/posts/([0-9]+)/comments/([0-9]+)': 'http://localhost:8080/p/$1/c/$2',
//     '/author/([0-9]+)/posts/([0-9]+)/': 'http://localhost:8080/a/$1/p/$2/'
//   },
//   default: 'http://localhost:8080'
// }
var createServer = function (config, callback) {
  config = Object.assign({ }, defaultConfig, config)
  // setup proxy rules
  var proxyRules = new HttpProxyRules(config.ruleConfig)
  // create reverse proxy instance
  var proxy = httpProxy.createProxy()

  var projectRootPath = config.projectRootPath
  var staticDirectory = config.staticDirectory

  var hasStatic = !!staticDirectory
  var hasProjectRootPath = !!projectRootPath

  console.log('hasStatic =', hasStatic)
  hasStatic && console.log('staticDirectory =', staticDirectory)
  console.log('hasProjectRootPath =', hasProjectRootPath)
  hasProjectRootPath && console.log('projectRootPath =', projectRootPath)

  var staticServer = null

  // 是否配置了 静态资源 路径
  if (hasStatic) {
    staticServer = new staticMaker.Server(staticDirectory)

    console.log('static server:', staticServer)
  }

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.');
  })

  // Listen for the `proxyRes` event on `proxy`.
  proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
  });

  // Listen for the `open` event on `proxy`.
  proxy.on('open', function (proxySocket) {
    // listen for messages coming FROM the target here
    // proxySocket.on('data', hybiParseAndLogMessage);
    console.log('Proxy Opened')
  });

  // Listen for the `close` event on `proxy`.
  proxy.on('close', function (res, socket, head) {
    // view disconnected websocket connections
    console.log('Client disconnected');
  });

  // Create http server that leverages reverse proxy instance
  // and proxy rules to proxy requests to different targets
  http.createServer(function (req, res) {
    var url = req.url
    var pathname = url$.parse(url).pathname
    // file in project root path
    if (hasProjectRootPath) {
      var filePath = path.join(projectRootPath, pathname)
      var exist = fs.existsSync(filePath)
      var ext = path.extname(filePath)

      console.log('exist', exist)
      console.log('filepath', filePath)

      if (exist) {
        return fs.readFile(filePath, 'binary', function (err, data) {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end(err.message)
            return
          }
          console.log('ext', ext, mime.getType(ext))
          res.writeHead(200, {
            'Content-Type': mime.getType(ext) || 'text/plain'
          })
          res.end(data, 'binary')
        })
      }
    }

    // at first, serve `static`
    if (hasStatic) {
      if (pathname[0] === '/') {
        pathname = pathname.slice(1)
      }

      var firstPath = pathname.split('/')[0]

      if (firstPath === STATIC) {
        var newPath = pathname.slice(STATIC_INDEX)
        console.log('serve static file', newPath)

        // fix the original url to a new url
        req.url = newPath
        return req.addListener('end', function () {
          // Serve files!
          staticServer.serve(req, res)
        }).resume()
      }
    }
    var target = proxyRules.match(req)
    console.log('proxy target', target)
    if (target) {
      return proxy.web(req, res, {
        target: target
      })
    }

    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('The request url and path did not match any of the listed rules!')
  })
    .listen(config.port, callback)
}

module.exports = createServer
