////////////////////////////////////////////////////////////////////////////////
// Database
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	sqlite = require('../tools/sqlite').sqlite,

db = function () {
	var self,
			name;
	
	// applies one patch
	function apply(version, handler) {
		self.nonQuery('patch.' + version + '.sql', function () {
			console.log("DB/" + name + " - patched to version " + version);
			if (handler) {
				handler();
			}
		});
	}
	
	// patches database to most recent version
	function patch(handler) {
		// getting current database version
		var statement = "SELECT value FROM system WHERE key = 'version'";
		self.query(statement, function (data) {
			var version = (data[0] || {value: '0.1'}).value;
			console.log("DB/" + name + " - version: " + version);
			if (version < '0.2') {
				apply('0.2', handler);
			} else if (handler) {
				handler();
			}
			return false;
		});
	}
	
	// creates database
	function create(handler) {
		console.log("DB - creating DB: " + name);
		sqlite.exec('create.sql', handler, [], true);
	}
	
	self = {
		// switches databases
		name: function (value, handler) {
			name = value;
			console.log("DB - switching over to DB: " + name);
			// switching to new db
			sqlite.db(name);
			if (!sqlite.exists()) {
				// creating new db
				create(handler);
			} else {
				// patching existing db
				patch(handler);
			}
		},

		// executes statement that return data		
		query: function (statement, handler) {
			console.log("DB/" + name + " - executing query");
			sqlite.exec(statement, handler, ['-header', '-line']);
		},
		
		// executes statement that changes data
		nonQuery: function (statement, handler) {
			console.log("DB/" + name + " - executing non-query");
			sqlite.exec(statement, handler);
		},
		
		// executes statement that changes data
		// feeds input to sqlite process with pipe
		nonQueryPiped: function (statement, handler) {
			console.log("DB/" + name + " - executing non-query with pipe");
			sqlite.exec(statement, handler, [], true);
		}
	};
	
	self.name('default');
	
	return self;
}();

exports.db = db;

