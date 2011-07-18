////////////////////////////////////////////////////////////////////////////////
// SQLite Database
//
// Data Access Layer
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */

var	$fs = require('fs'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,
		tempFile = 'temp.sql',

sqlite = function () {
	// inheriting from tool
	var db,
			path = 'server/db/',
			isWindows = tool.os in {'windows': 'windows', 'cygwin': 'cygwin'},
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: isWindows ? /\r\n\r\n\s*/ : /\n\n\s*/},
		fieldSeparator: {value: isWindows ? /\r\n\s*/ : /\n\s*/},
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

	// applies one patch
	function apply(version, handler) {
		self.exec('server/db/patch.' + version + '.sql', function () {
			console.log("SQLITE - DB/" + db + " patched to version " + version);
			if (handler) {
				handler();
			}
		});
	}
	
	// patches database to most recent version
	function patch(handler) {
		// getting current database version
		var statement = "SELECT value FROM system WHERE key = 'version'";
		self.exec(statement, function (data) {
			var version = (data[0] || {value: '0.1'}).value;
			console.log("SQLITE - DB/" + db + " version: " + version);
			if (version < '0.2') {
				apply('0.2', handler);
			} else if (handler) {
				handler();
			}
			return false;
		}, ['-header', '-line']);
	}
	
	// getter / setter for database name
	self.db = function (value, handler) {
		if (typeof value === 'undefined') {
			return db;
		} else {
			db = value;
			console.log("SQLITE - switching over to DB: " + db);
			patch(handler);
			return self;
		}
	};
	
	// executes an SQL command through the sqlite command line tool
	self.exec = function (statement, handler, options, pipe) {
		var	fileName = path + db + '.sqlite',
				args = (options || []).concat([fileName]);

		if (statement.match(/^.+\.sql$/ig)) {
			// reading statement from file
			console.log("SQLITE - reading SQL command from file: " + statement);
			statement = $fs.readFileSync(statement);
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
	
	self.db('default');
	
	return self;
}();

exports.sqlite = sqlite;

