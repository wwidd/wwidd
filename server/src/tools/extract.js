////////////////////////////////////////////////////////////////////////////////
// File Metadata Extraction Tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,

extract = function () {
	var
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: new RegExp(tool.lineBreak + tool.lineBreak)},
		fieldSeparator: {value: new RegExp(tool.lineBreak)},
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

