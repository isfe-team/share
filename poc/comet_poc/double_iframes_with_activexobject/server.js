const http = require('http')
const fs = require('fs')
const path = require('path')

http.createServer((req, res) => {
  if (req.url === '/inner.html' || req.url === '/plugin.js') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    const innerFileStream = fs.createReadStream(path.join(__dirname, req.url))

    innerFileStream.pipe(res)

    return
  }
  if (req.url === '/stream') {
    console.log('aha')

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    let cnt = 0

    req.cometTimer = setInterval(() => {
      const currentTime = Date.now()
      console.log(`send ${currentTime}`)
      res.write(`
        <script type="text/javascript">
          parent.callback('${currentTime}')
        </script>
        <div>第${++cnt}条消息</div>
      `)
    }, 1000)

    req.connection.on('close', () => {
      console.log('close')

      clearInterval(req.cometTimer)

      res.end()
    })

    return
  }

  res.end('No')
}).listen(3000)

console.log('Server running on port 3000')
