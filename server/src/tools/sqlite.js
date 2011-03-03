////////////////////////////////////////////////////////////////////////////////
// SQLite Database
//
// Data Access Layer
////////////////////////////////////////////////////////////////////////////////
var	$fs = require('fs'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,
		tempFile = './temp.sql',

// - dbPath: path to SQLite database file
sqlite = function (dbPath) {
	// inheriting from tool
	var
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: /\n\n\s*/},
		fieldSeparator: {value: /\n\s*/},
		keySeparator: {value: ' = '}
	}),

	self = Object.create(tool, {
		executable: {value: 'sqlite3'},
		parser: {value: outputParser}
	});
			
	// executes an SQL command through the sqlite command line tool
	self.exec = function (statement, handler, options, useTemp) {
		var	args = options || [];
		
		// writing statement to temp file
		if (useTemp) {
			// using a temp file
			console.log("Writing SQL statement to temp file...");
			$fs.writeFileSync(tempFile, statement);
			console.log("SQL temp file written.");
			args = args.concat([dbPath, '<', tempFile]);
		} else {
			// passing the command directly
			args = args.concat([dbPath, '"' + statement + '"']);
		}

		// running sql statement
		tool.exec(args, function (data) {
			if (handler) {
				handler(data);
			}
		}, self);
	};
	
	return self;
};

exports.sqlite = sqlite('../etc/db/metabase');

