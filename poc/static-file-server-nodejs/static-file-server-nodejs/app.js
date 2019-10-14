/**
 *
 * @name 		app.js
 * @desc 	 	entry script
 * @author		bqliu
 * @time 		03/17/2016
 *
 */

;(function() {
	'use strict';

	let PORT   = process.argv[2] || 10240;
	// console.log(process.argv);

	let http   = require('http'),
		url    = require('url'),
		fs 	   = require('fs'),
		path   = require('path'),
		zlib   = require('zlib');

	let mime   = require('./mime').types,
		config = require('./config');

	let server = http.createServer((req, res) => {
		res.setHeader('Server', 'Node/V4');
		res.setHeader('Accept-Ranges', 'bytes')

		let pathname = url.parse(req.url).pathname;
		// 支持目录
		if (pathname.slice(-1) === '/')
			pathname = pathname + config.welcome.file;

		let realPath = path.join('assets', path.normalize(pathname.replace(/\.\./g, ''))); // path.join(__dirname, 'assets', pathname);
		// console.log(realPath);

		let pathHandle = function(realPath) {
			fs.stat(realPath, (err, stat) => {
				if (err) {
					res.writeHead(404, 'Not Found', { 'Content-Type': 'text/plain' });
					res.write('This request URL ' + realPath + ' was not found on this server.');
					res.end();
				}
				else {
					if (stat.isDictionary()) {
						realPath = path.join(realPath, '/', config.welcome.file);
						arguments.callee(realPath);
					}
					else {
						let ext = path.extname(realPath);
						ext = ext ? ext.slice(1) : 'unknown';

						let contentType = mime[ext] || 'text/plain';
						res.setHeader('Content-Type', contentType);
						res.setHeader('Content-Length', stat.size);

						let lastModified = stat.mtime.toUTCString();
						let ifModifiedSince = "If-Modified-Since".toLowerCase();
						res.setHeader('Last-Modified', lastModified);

						if (ext.match(config.expires.fileMatch)) {
							var expires = new Date();
							expires.setTime(expires.getTime() + config.expires.maxAge * 1000);
							// Cache-Control的优先级高于Expires
							res.setHeader('Expires', expires.toUTCString());
							res.setHeader('Cache-Control', 'max-age=' + config.expires.maxAge);
						}

						if (req.headers[ifModifiedSince] && lastModified === req.headers[ifModifiedSince]) {
							res.writeHead(304, 'Not Modified');
							res.end();
						}

						else {
							res.setHeader("Last-Modified", lastModified);

							fs.readFile(realPath, "binary", (err, file) => {
								if (err) {
									res.writeHead(500, {
										'Content-Type': 'text/plain'
									});

									res.end("ERROR :" + err.toString());
									return ;
								}

								res.write(file, 'binary');
								res.end();
							});
						}
					}
				};
			});
		}
	});

	server.listen(PORT);
	console.log('Server running at port: ' + PORT + '.');
})();
