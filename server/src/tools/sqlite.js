////////////////////////////////////////////////////////////////////////////////
// SQLite Database
//
// Data Access Layer
////////////////////////////////////////////////////////////////////////////////
var	$fs = require('fs'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,
		tempFile = './temp.sql',

sqlite = function () {
	// inheriting from tool
	var db = 'default',
			path = '../db/',
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: /\n\n\s*/},
		fieldSeparator: {value: /\n\s*/},
		keySeparator: {value: ' = '}
	}),

	self = Object.create(tool, {
		executable: {value: 'sqlite3'},
		parser: {value: outputParser}
	});
	
	// getter for path property
	self.path = function () {
		return path;
	};
	
	// getter / setter for 
	self.db = function (value) {
		if (typeof value === 'undefined') {
			return db;
		} else {
			db = value;
			return self;
		}
	};
	
	// executes an SQL command through the sqlite command line tool
	self.exec = function (statement, handler, options, useTemp) {
		var	fileName = path + db + '.sqlite',
				args = options || [];
		
		// writing statement to temp file
		if (useTemp) {
			// using a temp file
			console.log("Writing SQL statement to temp file...");
			$fs.writeFileSync(tempFile, statement);
			console.log("SQL temp file written.");
			args = args.concat([fileName, '<', tempFile]);
		} else {
			if (statement.match(/^.+\\.sql$/ig)) {
				// reading sql from file
				args = args.concat([fileName, '<', path + statement]);
			} else {
				// passing the command directly
				args = args.concat([fileName, '"' + statement + '"']);
			}
		}

		// running sql statement
		tool.exec(args, function (data) {
			if (handler) {
				handler(data);
			}
		}, self);
	};
	
	return self;
}();

exports.sqlite = sqlite;

