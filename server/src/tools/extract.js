////////////////////////////////////////////////////////////////////////////////
// File Metadata Extraction Tool
////////////////////////////////////////////////////////////////////////////////
var	tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,

extract = function () {
	var
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: '\n\n'},
		fieldSeparator: {value: '\n'},
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

