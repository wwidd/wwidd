////////////////////////////////////////////////////////////////////////////////
// Cygpath
//
// Path resolution tool for Cygwin environment
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	$path = require('path'),
		tool = require('../tools/tool').tool,

cygpath = function () {
	var self = Object.create(tool, {executable: {value: 'cygpath'}});
			
	self.exec = function (path, handler) {
		tool.exec.call(self, ['-w', path], handler ? function (code, data) {
			handler(data.replace(/\s+/g, ''));
		} : handler);
		return self;
	};
	
	return self;
}();

exports.cygpath = cygpath;

