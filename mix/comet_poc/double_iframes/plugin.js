;(function () {
	var iframe = document.createElement('iframe')

	iframe.src = 'http://www.b.com:3000/stream'

	// 简单绑定，注意使用addEventListener/attachEvent
	// 防止 loading 状态
	window.onload = function () {
		// 双层保险
		setTimeout(function () {
			document.body.appendChild(iframe)
		})
	}

	// 注意防止覆盖了第三方的
	onmessage = function (event) {
		// fool ie
		event = event || window.event
		parent.postMessage(event.data, '*')
		// if (event.origin == 'http://www.b.com:3000') {
		// 	// fool ie, again
		// 	document.getElementById('echo').innerText = 'accept message from remote: ' + event.data
		// }
	}
})()
