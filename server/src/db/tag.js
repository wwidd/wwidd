////////////////////////////////////////////////////////////////////////////////
// Tag Entity
////////////////////////////////////////////////////////////////////////////////
var	sqlite = require('../tools/sqlite').sqlite,
		entity = require('../db/entity').entity,
		clause = require('../db/entity').clause,

tag = function () {
	var self = Object.create(entity, {kind: {value: 'tags'}});

	// updates a batch of tags
	self.set = function (before, after, handler) {
		var	where =  clause(before).join(" AND "),
		
		statement = (before.mediaid ? [
			// updaing a single tag
			"BEGIN TRANSACTION",
			// deleting old tag name
			["DELETE FROM", self.kind, "WHERE", where].join(" "),
			// inserting new name
			["INSERT OR IGNORE INTO", self.kind, "(mediaid, tag)", "VALUES", "(" + [before.mediaid, "'" + after.tag + "'"].join(",") + ")"].join(" "),
			"COMMIT"
		] : [
			// updaing multiple tags
			"BEGIN TRANSACTION",
			// marking mediaids that contain the old tag name
			"CREATE TEMPORARY TABLE focus (mediaid INTEGER)",
			["INSERT INTO focus (mediaid) SELECT mediaid FROM", self.kind, "WHERE", where].join(" "),
			// deleting entries that already contain both the old and new names
			["DELETE FROM", self.kind, "WHERE mediaid IN focus AND", where].join(" "),
			// inserting new tag names
			["INSERT OR IGNORE INTO", self.kind, "(mediaid, tag)", "SELECT mediaid, '" + after.tag + "' AS tag FROM focus"].join(" "),
			"DROP TABLE focus",
			"COMMIT"
		]).join(";\n");
		
		console.log(statement);
		
		sqlite.exec(statement, handler);
	};
	
	return self;
}();

exports.tag = tag;

