var results = []

function resultReceiver(event) {
  results.push(parseInt(event.data))
  if (results.length == 2) {
    postMessage(results[0] + results[1])
  }
}

function errorReceiver(event) {
  throw event.data
}

function sendReq() {
  // var xhr = new XMLHttpRequest()
  // xhr.open('GET', 'http://127.0.0.1:8080')
  // xhr.send()

  // 下面是测试 Promise 加入了之后是否有影响
  new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        resolve(this.response)
      }
    }
    xhr.open('GET', 'http://127.0.0.1:8080')
    xhr.send()
  })
    .then(function (res) {
      console.log('res:', res.slice(0, 10) + '...')
    })
    .catch(function (error) {
      console.error(error.message)
    })
}

var curDate = Date.now()

/* loop 测试效果 */
function polling() {
  setInterval(function () {
    var now = Date.now()

    postMessage(now - curDate)

    console.log('看看我能不能正常的打出来', now - curDate)

    curDate = now

    sendReq()
  }, 2 * 1000)
}

polling()

onmessage = function(event) {
  var n = parseInt(event.data)

  if (n == 0 || n == 1) {
    postMessage(n)
    return
  }

  for (var i = 1; i <= 2; i++) {
    // 测试 worker 中再加  worker
    // var worker = new Worker("fibonacci.js")
    // worker.onmessage = resultReceiver
    // worker.onerror = errorReceiver
    postMessage(n - i);
  }
};
