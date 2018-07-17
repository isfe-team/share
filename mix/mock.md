# Something about mock

By @bqliu.

## 为什么要 mock

这个基本没必要说，需要 mock 或者有相关痛点的应该都清楚。

## 如何 mock

### 代码中写死数据

小的方法参数 mock ok，但是用于接口响应数据 mock、或者需要模拟的数据很复杂就很尴尬。

### 单独的 data.json 文件/模块

简单说不足：

1、不灵活
2、数据结构变更时维护麻烦（比如列表数据或者复杂数据）

### 专门的 mock 流程

根据数据结构写好数据model/schema，然后根据模型随机产出数据，达到数据的动态化。

在业务代码中，维护 `mockUrls` ，然后在请求之前判断是否在 `mockUrls` ，如果是，加上一个特殊的上下文。代码示例如下：

```javascript
const MOCK_CONTEXT_PATH = '/mock'
const mockUrls = [ 'user/getUserInfo' ]

// others

// 在请求拦截器中
if (mockUrls.indexOf(config.url) !== -1) {
  config.url = MOCK_CONTEXT_PATH + '/' + config.url
}

// others
```

这样我们就可以使得除了 `users/getUserInfo` 的接口请求都走正常的业务接口，而 `users/getUserInfo` 走的是带有特殊路径的地址。

> 为什么要存在 `mockUrls`，而不是直接切换开发和模拟环境。1是因为我们在开发过程中需要同时调用业务服务和模拟服务。

剩下的我们就是需要有一个 `mock` 服务，同时解决 `mock` 请求代理的问题。

#### mock 服务创建

mock 服务最起码需要两部分，1是接口请求处理，2是根据模型生成模拟的数据。

创建服务、接口地址匹配、生成模拟数据都很简单，栗子（使用的是mockjs以及http等模块来做的）如下：

```javascript
/*!
 * start mock server
 *
 * 不考虑指定 request type（Restful api）
 * 如有必要，之后再完善
 *
 * 不考虑入参之类的 
 */

const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')
const Mock = require('mockjs')
const urlMockMap = require('.')

const PORT = 5000

const generateRegExpUrlMockMap = (urlMockMap) => Object.keys(urlMockMap).map((url) => ({
  rUrl: new RegExp(`^${url}$`),
  schema: urlMockMap[url]
}))

const rUrlMockMap = generateRegExpUrlMockMap(urlMockMap)

console.log('>> rUrlMockMap:', rUrlMockMap)

const getMatchedSchemaByUrl = (url) => {
  let matched = null
  rUrlMockMap.some(({ rUrl, schema }) => {
    const valid = rUrl.test(url)
    if (valid) {
      matched = schema
    }
    return valid
  })

  return matched
}

const server = http.createServer((req, res) => {

  const parsedUrl = url.parse(req.url)

  let { pathname } = parsedUrl
  pathname = pathname[0] === '/' ? pathname.slice(1) : pathname

  const schema = getMatchedSchemaByUrl(pathname)
  if (!schema) {
    res.writeHead(404, 'Not Found')
    res.end('404')
    return
  }

  res.setHeader('Content-Type', 'application/json')

  res.end(JSON.stringify(Mock.mock(schema)), 'utf-8', () => {
    console.log('>> Mock url:', req.url)
  })
})

server.on('error', (err) => {
  /* ignore */
  console.error('>> Mock server error:', err)
})

server.listen(PORT, () => {
  console.log('>> server listening on port:', PORT)
})

```

其中 `user-info.json` 如下：

```json
{
  "id|+1": 1,
  "name": "@cfirst@clast"
}
```

`urlMockMap` 模块定义如下：

```javascript
/*!
 * mock url & schema mapping config
 */

module.exports = {
  'user/getUserInfo': require('./schemas/user-info')
}
```

#### mock 服务代理

代理的话怎么简单怎么来，比如：

```javascript
{
  '/api/mock': {
    target: mockServer,
    pathRewrite: {
      '^/api/mock': ''
    }
  },
  '/api': {
    target: backendServer
  }
}
```

嗯，结束。挺简单的吧 =、=
