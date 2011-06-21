////////////////////////////////////////////////////////////////////////////////
// File Metadata Extraction Tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	$os = require('os'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,

extract = function () {
	var isLinux = $os.type() === 'Linux',
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: isLinux ? '\n\n' : '\r\n\r\n'},
		fieldSeparator: {value: isLinux ? '\n' : '\r\n'},
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
		tool.exec(args.concat([path]), handler, self);
	};
	
	return self;
}();

exports.extract = extract;

