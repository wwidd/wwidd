////////////////////////////////////////////////////////////////////////////////
// GZip
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	tool = require('../tools/tool').tool,

gzip = function () {
	// inheriting from tool
	var self = Object.create(tool, {executable: {value: 'gzip'}});
	
	self.exec = function (handler) {
		tool.exec(null, handler, self);
	};
	
	return self;
}();

exports.gzip = gzip;

