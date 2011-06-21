////////////////////////////////////////////////////////////////////////////////
// Tag Entity
////////////////////////////////////////////////////////////////////////////////
var	$media = require('../db/media'),
		sqlite = require('../tools/sqlite').sqlite,
		entity = require('../db/entity').entity,
		clause = require('../db/entity').clause,

tag = function () {
	var base = Object.create(entity, {kind: {value: 'tags'}}),
			self = Object.create(base);

	// retrieves all tags
	self.getTags = function (handler) {
		var statement = "SELECT DISTINCT lower(name) AS name, CASE WHEN kind IS NOT NULL THEN kind ELSE '' END AS kind FROM tags";
		
		console.log(statement);
		sqlite.exec(statement, handler, ['-header', '-line']);
	};
	
	// adds one tag to the file
	self.add = function (after, filter, mediaids, handler) {
		var tmp = after.tag.split(':'),
				name = "'" + tmp[0] + "'",
				kind = tmp[1] ? "'" + tmp[1] + "'" : "NULL",

		statement = (filter || mediaids ? [
			"INSERT OR IGNORE INTO",
			self.kind,
			"(mediaid, name, kind)",
			["SELECT mediaid", name, kind].join(","),
			"FROM tags",
			mediaids ?
				$media.selection(mediaids) :
				$media.filter(filter)
		] : [
			"INSERT OR IGNORE INTO",
			self.kind,
			"(mediaid, name, kind) VALUES",
			"(" + [after.mediaid, name, kind].join(',') + ")"
		]).join(" ");
				
		console.log(statement);
		sqlite.exec(statement, handler);		
	};
	
	// updates a batch of tags
	self.set = function (before, after, handler) {
		// separating tag name and kind
		before.name = before.tag.split(':')[0];
		delete before.tag;
		
		var	where =  clause(before).join(" AND "),
				tmp = after.tag.split(':'),
				name = "'" + tmp[0] + "'",
				kind = tmp[1] ? "'" + tmp[1] + "'" : "NULL",
		
		statement = (before.mediaid ? [
			// updaing a single tag
			"BEGIN TRANSACTION",
			// deleting old tag name
			["DELETE FROM", self.kind, "WHERE", where].join(" "),
			// inserting new name
			["INSERT OR IGNORE INTO",
				self.kind, "(mediaid, name, kind)",
				"VALUES",
				"(" + [before.mediaid, name, kind].join(",") + ")"
			].join(" "),
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
			["INSERT OR IGNORE INTO",
				self.kind, "(mediaid, name, kind)",
				"SELECT mediaid,",
				name + " AS name,",
				kind + " AS kind",                         
				"FROM focus"
			].join(" "),
			"DROP TABLE focus",
			"COMMIT"
		]).join(";\n");
		
		console.log(statement);
		sqlite.exec(statement, handler);
	};
	
	// removes tag from file(s)
	self.remove = function (before, filter, mediaids, handler) {
		var mediaid = before.mediaid,
				name = "'" + before.tag.split(':')[0] + "'",
				clause = mediaids ?
					$media.selection(mediaids) + " AND" :
					filter ?
						$media.filter(filter) + " AND" :
						"WHERE",

		statement = [
			"DELETE FROM", self.kind,
			clause,
			"name = " + name,
			mediaid ? "AND mediaid = " + mediaid : ""
		].join(" ");

		console.log(statement);
		sqlite.exec(statement, handler);
	};
	
	return self;
}();

exports.tag = tag;

