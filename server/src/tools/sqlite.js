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
	self.exec = function (statement, handler, options, pipe) {
		var	fileName = path + db + '.sqlite',
				args = (options || []).concat([fileName]);

		if (statement.match(/^.+\\.sql$/ig)) {
			// reading statement from file
			statement = $fs.readFileSync(statement);
		}
		
		if (!pipe) {
			// passing the command directly
			args = args.concat([statement]);
		}

		// running sql statement
		tool.exec(args, function (data) {
			if (handler) {
				handler(data);
			}
		}, self);

		// piping statement to sqlite process
		if (pipe) {
			self.pipe(statement);
		}
	};
	
	return self;
}();

exports.sqlite = sqlite;

