////////////////////////////////////////////////////////////////////////////////
// SQLite Database
//
// Data Access Layer (low-level)
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */

var	$fs = require('fs'),
		$path = require('path'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,
		tempFile = 'temp.sql',

sqlite = function () {
	// inheriting from tool
	var db = 'default',
			path = 'server/db/',
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: new RegExp(tool.lineBreak + tool.lineBreak + '\\s*')},
		fieldSeparator: {value: new RegExp(tool.lineBreak + '\\s*')},
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

	// getter / setter for database name
	// - value: database name
	self.db = function (value) {
		if (typeof value === 'undefined') {
			return db;
		} else {
			db = value;
			return self;
		}
	};
	
	// checks whether current database exists
	self.exists = function () {
		var fileName = path + db + '.sqlite',
				exists = $path.existsSync(fileName);
		return exists;
	};
	
	// executes an SQL command through the sqlite command line tool
	// - statement: SQL statement or SQL file path to execute
	// - handler: callback passed to tool
	// - options: additional command line arguments
	// - pipe: whether statement should be passed through stdin
	self.exec = function (statement, handler, options, pipe) {
		var	fileName = path + db + '.sqlite',
				args = (options || []).concat([fileName]);

		if (statement.match(/^.+\.sql$/ig)) {
			// reading statement from file
			console.log("SQLITE - reading SQL command from file: " + statement);
			statement = $fs.readFileSync('server/db/' + statement);
		}
		
		if (!pipe) {
			// passing the command directly
			args = args.concat([statement]);
		}

		// running sql statement
		tool.exec.call(self, args, function (data) {
			if (handler) {
				console.log("SQLITE - retrieved " + data.length + " records.");
				return handler(data);
			}
		}, true);

		// piping statement to sqlite process
		if (pipe) {
			self.pipe(statement);
		}
	};
	
	return self;
}();

exports.sqlite = sqlite;

