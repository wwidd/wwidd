////////////////////////////////////////////////////////////////////////////////
// SQLite Database
//
// Data Access Layer (low-level)
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, setTimeout, console */

var	$fs = require('fs'),
		$path = require('path'),
		tool = require('./tool').tool,
		parser = require('../utils/parser').parser,
		tempFile = 'temp.sql',

sqlite = function () {
	var db = 'default',
			path = '../db/',
	
	// constants
	RETRY_COUNT = 3,
	RETRY_DELAY = 1000,
			
	// return codes
	SQLITE_OK = 0,					// Successful result
	SQLITE_ERROR = 1,				// SQL error or missing database
	SQLITE_INTERNAL = 2,		// Internal logic error in SQLite
	SQLITE_PERM = 3,				// Access permission denied
	SQLITE_ABORT = 4,				// Callback routine requested an abort
	SQLITE_BUSY = 5,				// The database file is locked
	SQLITE_LOCKED = 6,			// A table in the database is locked
	SQLITE_NOMEM = 7,				// A malloc() failed
	SQLITE_READONLY = 8,		// Attempt to write a readonly database
	SQLITE_INTERRUPT = 9,		// Operation terminated by sqlite3_interrupt()
	SQLITE_IOERR = 10,			// Some kind of disk I/O error occurred
	SQLITE_CORRUPT = 11,		// The database disk image is malformed
	SQLITE_NOTFOUND = 12,		// Unknown opcode in sqlite3_file_control()
	SQLITE_FULL = 13,				// Insertion failed because database is full
	SQLITE_CANTOPEN = 14,		// Unable to open the database file
	SQLITE_PROTOCOL = 15,		// Database lock protocol error
	SQLITE_EMPTY = 16,			// Database is empty
	SQLITE_SCHEMA = 17,			// The database schema changed
	SQLITE_TOOBIG = 18,			// String or BLOB exceeds size limit
	SQLITE_CONSTRAINT = 19,	// Abort due to constraint violation
	SQLITE_MISMATCH = 20,		// Data type mismatch
	SQLITE_MISUSE = 21,			// Library used incorrectly
	SQLITE_NOLFS = 22,			// Uses OS features not supported on host
	SQLITE_AUTH = 23,				// Authorization denied
	SQLITE_FORMAT = 24,			// Auxiliary database format error
	SQLITE_RANGE = 25,			// 2nd parameter to sqlite3_bind out of range
	SQLITE_NOTADB = 26,			// File opened that is not a database file
	SQLITE_ROW = 100,				// sqlite3_step() has another row ready
	SQLITE_DONE = 101,			// sqlite3_step() has finished executing
	
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
				exists = $fs.existsSync(fileName) && $fs.statSync(fileName).size > 0;
		return exists;
	};
	
	// executes an SQL command through the sqlite command line tool
	// - statement: SQL statement or SQL file path to execute
	// - handler: callback passed to tool
	// - options: additional command line arguments
	// - pipe: whether statement should be passed through stdin
	self.exec = function (statement, handler, options, pipe) {
		var	fileName = path + db + '.sqlite',
				args = (options || []).concat([fileName]),
				retries = 0;

		if (statement.match(/^.+\.sql$/ig)) {
			// reading statement from file
			console.log("SQLITE - reading SQL command from file: " + statement);
			statement = $fs.readFileSync('../db/' + statement);
		}
		
		if (!pipe) {
			// passing the command directly
			args = args.concat([statement]);
		}

		function onComplete(code, data) {
			switch (code) {
			case SQLITE_OK:
				console.log("SQLITE - retrieved " + (data ? data.length : 0) + " records.");
				if (handler) {
					handler(data);
				}
				break;
			case SQLITE_BUSY:
			case SQLITE_LOCKED:
				if (retries >= RETRY_COUNT) {
					throw "Database or table still locked after " + retries + " retries, query failed";
				} else {
					retries++;
					console.log("SQLITE - database or table locked, re-running query (" + retries + "/" + RETRY_COUNT + ")");
					setTimeout(function () {
						tool.exec.call(self, args, onComplete, true);
					}, RETRY_DELAY);
				}
				break;
			default:
				console.log("SQLITE - query failed");
				console.log(statement);
				if (handler) {
					handler();
				}
			}
		}
		
		// running sql statement
		tool.exec.call(self, args, onComplete, true);

		// piping statement to sqlite process
		if (pipe) {
			self.pipe(statement);
		}
	};
	
	return self;
}();

exports.sqlite = sqlite;

