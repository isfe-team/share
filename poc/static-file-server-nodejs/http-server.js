/**
 * HTTP SERVER
 * @author 		bq-hentai
 * @time 		03/17/2016
 */

;(function() {
	'use strict';

	let http = require('http');
	let fs = require('fs');
	let url = require('url');
	let path = require('path');

	// 艹的次数
	let reqTimes = 0;

	// 获取远程client Ip
	function getClientIp(req) {
		// 反向头代理 => connection的远程IP => 后端的socket IP
		return req.headers['x-forwarded-for'] ||
			   req.connection.remoteAddress ||
			   req.socket.remoteAddress ||
			   req.connection.socket.remoteAddress;
	}

	// 发送静态资源文件
	function sendStaticFile(filePath, res) {
		var realPath = path.join(__dirname, filePath);
		fs.exists(realPath, (exists) => {
			if (! exists) {
				res.writeHead(404, { 'Content-type': 'text/plain'} );
				res.end('没有找到此文件');
				return ;
			}
			fs.readFile(realPath, 'binary', (err, file) => {
				if (err) {
					res.writeHead(505, { 'Content-type': 'text/plain' });
					res.end(err);
					return ;
				}
				res.writeHead(200, { 'Content-type': 'application/octet-stream' } );
				res.write(file, 'binary');
				res.end();
			});
		})
	}

	http.createServer((req, res) => {
		let clientIp = getClientIp(req);
		++ reqTimes;
		// 打开logs进行记录
		let singleRecord = `\n第${ reqTimes }次请求，请求的url是${ req.url }，请求来自于 ${ clientIp } 且连接类型为 ${ req.headers.connection }`;
		fs.open('./logs.txt', 'a', (err, fd) => {
			var buffer = new Buffer(singleRecord);
			fs.writeSync(fd, buffer, 0, buffer.length, (err, written, buffer) => {
				if (err)
					throw err;
				console.log(written + ' bytes written and buffer is ' + buffer);
			})
		})
		if (req.url === '/favicon.ico') {
			sendStaticFile(url.parse(req.url).pathname, res);
			return ;
		}
		// 发送 HTTP 头部 | 状态值 200 <=> OK | 内容类型为 text/plain
		res.writeHead(200, { 'Content-Type': 'text/plain' });

		// 发送响应数据
		res.end('please say hello to bq-hentai.');
	}).listen('10240');

	console.log('Server running at http://127.0.0.1:10240/');
})();
