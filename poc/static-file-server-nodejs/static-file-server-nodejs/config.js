/**
 *
 * @name 		config.js
 * @desc 	 	configurations
 * @author		bqliu
 * @time 		03/17/2016
 *
 */

;(function() {
	exports.expires = {
		fileMatch: /^(gif|png|jpg|jpeg|js|css)$/ig,
		maxAge: 60 * 60 * 24 * 365
	};

	exports.compress = {
		match: /css|js|html/ig
	};

	exports.welcome = {
		file: 'index.html'
	}
})();
