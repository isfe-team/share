const http = require('http')
const fs = require('fs')

http.createServer((req, res) => {
  if (req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    let cnt = 0

    req.cometTimer = setInterval(() => {
      res.write(`
        <script type="text/javascript">
          parent.postMessage('${Date.now()}', '*') 
        </script>
        <div>第${++cnt}条消息</div>
      `);
    }, 1000)

    req.connection.on('close', () => {
      console.log('close')

      clearInterval(req.cometTimer)

      res.end()
    })
  } else {
    res.end('No')
  }
}).listen(3000)

console.log('Server running on port 3000')
