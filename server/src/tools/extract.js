////////////////////////////////////////////////////////////////////////////////
// File Metadata Extraction Tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,

extract = function () {
	var isWindows = tool.os in {'windows': 'windows', 'cygwin': 'cygwin'},
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: isWindows ? '\r\n\r\n' : '\n\n'},
		fieldSeparator: {value: isWindows ? '\r\n' : '\n'},
		keySeparator: {value: ' - '},
		rowSkip: {value: 0},
		fieldSkip: {value: 1},
		rowHandler: {value: function (row) {
			return row.mimetype && row.mimetype.indexOf('video') !== -1;
		}}
	}),
	
	// inheriting from tool
	self = Object.create(tool, {
		executable: {value: 'extract'},
		parser: {value: outputParser}
	});
	
	self.exec = function (path, args, handler) {
		tool.exec.call(self, args.concat([path]), handler);
	};
	
	return self;
}();

exports.extract = extract;

