;(function () {
  var streamUrl = 'http://www.b.com:3000/stream'
  // var streamUrl = 'http://10.5.22.187:3000/stream'

  var connectHtmlFile = function (url, callback) {
    // global
    transferDoc = new ActiveXObject('htmlfile')
    transferDoc.open()
    transferDoc.write(
      '<html>' +
        '<head><script>' +
        '</script></head>' +
        '<body>' +
        '</body>' +
      '</html>'
    )
    transferDoc.close()

    var ifrDiv = transferDoc.createElement('div')
    transferDoc.body.appendChild(ifrDiv)
    ifrDiv.innerHTML = '<iframe src="' + url + '"></iframe>'

    transferDoc.parentWindow.callback = callback

    transferDoc.onload = function () {
      if (this.readyState === 'complete') {
        parent.postMessage('请求 error', '*')
      }
    }

    transferDoc.onerror = function () {
      parent.postMessage('出错了', '*')
    }
  }

  var closeHtmlFile = function () {
    transferDoc = null
  }

  window.onerror = function () {
    parent.postMessage('出错了', '*')
  }

  window.onload = function () {

    // 存在两问题，8/9 支持Level1；10/11 response会一直加，最后应该会崩掉= =
    // var xhr = new XMLHttpRequest()
    // xhr.onreadystatechange = function () {
    //   if (xhr.readyState === 3) {
    //     parent.postMessage(xhr.response, '*')
    //   }
    // }

    // xhr.open('GET', './stream', true)

    // xhr.send()

    connectHtmlFile(streamUrl, function (data) {
      parent.postMessage(data, '*')

      document.getElementById('echo').innerText = data
    })
  }
})()
