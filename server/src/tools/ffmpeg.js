////////////////////////////////////////////////////////////////////////////////
// ffmpeg tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	$path = require('path'),
		tool = require('../tools/tool').tool,

ffmpeg = function () {
	// inheriting from tool
	var self = Object.create(tool, {executable: {value: 'ffmpeg'}});

	self.metadata = function (path, handler) {
		tool.exec.call(self, [path], handler);
	};
	
	// extracts thumbnail(s) from media file
	self.thumb = function (inPath, outPath, count, handler) {
		// check if thumbnail exists
		tool.exec.call(self, [
			'-i', inPath,
			'-f', 'image2',
			'-vframes', count || 1,
			'-s', 'sqcif',
			'-aspect', '4:3',
			'-ss', '15',
			outPath
		], handler);
	};
	
	return self;
}();

exports.ffmpeg = ffmpeg;

