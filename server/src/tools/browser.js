////////////////////////////////////////////////////////////////////////////////
// Web Browser
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	$os = require('os'),
		tool = require('../tools/tool').tool,

browser = function () {
	// inheriting from tool
	var executable = {'Windows': 'start', 'Linux': 'xdg-open'}[$os.type()] || 'open',
			self = Object.create(tool, {executable: {value: executable}});
			
	self.exec = function (url, handler) {
		tool.exec.call(self, [url], handler);
		return self;
	};
	
	return self;
}();

exports.browser = browser;

