////////////////////////////////////////////////////////////////////////////////
// Video Library - Data Model
////////////////////////////////////////////////////////////////////////////////
var	$path = require('path'),
		quotes = require('../db/entity').quotes,
		sqlite = require('../tools/sqlite').sqlite, 

library = function () {
	var self = {
		// queries the entire library
		getAll: function (handler) {
			var statement = "SELECT mediaid, path, rating, group_concat(tag || ':' || CASE WHEN kind IS NOT NULL THEN kind ELSE '' END) AS tags FROM media NATURAL JOIN tags GROUP BY mediaid;";
			sqlite.exec(statement, handler, ['-header', '-line']);
		},
		
		// inserts videos into the database 
		fill: function (data, handler) {
			var	statement = [],
					keywords,
					tags,
					i,
					buffer,
					fd,
					lastid = "(SELECT value FROM vars WHERE name = 'lastid')";
	
			console.log("Building ingest SQL statement...");
			statement.push("BEGIN TRANSACTION;");
			
			// adding temporary table to store last accessed media id
			statement.push("CREATE TEMPORARY TABLE vars (name TEXT, value INTEGER);");
			statement.push("INSERT INTO vars (name, value) VALUES ('lastid', 0);");
			
			for (path in data) {
				// inserting statement for media path
				statement.push([
					"INSERT OR IGNORE INTO media (path) VALUES ('",
					quotes(path),
					"');"
				].join(""));
				
				// updating last accessed media id so sub-inserts can use that
				statement.push([
					"UPDATE vars SET value = (",
					"SELECT mediaid FROM media WHERE path = '",
					quotes(path),
					"') WHERE name = 'lastid';"
				].join(""));
				
				// inserting statement for media keywords (properties)
				keywords = data[path];
				for (keyword in keywords) {
					statement.push([
						"INSERT OR REPLACE INTO keywords (mediaid, key, value) VALUES (",
						lastid, ",'",
						keyword, "','",
						quotes(keywords[keyword]),
						"');"
					].join(""));
				}
				
				// inserting statement for auto tags
				tags = []
					// filename broken down into its word-like components
					.concat($path.basename(path, $path.extname(path)).split(/[^A-Za-z0-9]+/))
					// path stripped of non-word characters and broken down by directory levels
					.concat($path.dirname(path).replace(/[^A-Za-z0-9\/\\\s]/g, '').split('/'));

				for (i = 0; i < tags.length; i++) {
					if (!tags[i].length) {
						continue;
					}
					statement.push([
						"INSERT OR REPLACE INTO tags (mediaid, tag) VALUES (",
						lastid, ",'",
						quotes(tags[i]),
						"');"				
					].join(""));
				}
			}
			statement.push("COMMIT;");
			console.log(["SQL statement built:", statement.length, "lines."].join(' '));
			
			// executing statement
			sqlite.exec(statement.join('\n'), handler, null, true);
			
			return self;
		}
	};
	
	return self;
}();

exports.library = library;

