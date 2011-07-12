////////////////////////////////////////////////////////////////////////////////
// Web Browser
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	$os = require('os'),
		tool = require('../tools/tool').tool,

browser = function () {
	// inheriting from tool
	var executable = {'cygwin': 'cmd', 'windows': 'cmd', 'linux': 'xdg-open'}[tool.os] || 'open',
			self = Object.create(tool, {executable: {value: executable}});
			
	self.exec = function (url, handler) {
		var args = {'cygwin': ['/c', 'start ' + url], 'windows': ['/c', 'start ' + url]}[tool.os] || [url];
		tool.exec.call(self, args, handler);
		return self;
	};
	
	return self;
}();

exports.browser = browser;

