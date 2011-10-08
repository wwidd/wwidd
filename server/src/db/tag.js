////////////////////////////////////////////////////////////////////////////////
// Tag Entity
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$media = require('../db/media'),
		db = require('../db/db').db,
		entity = require('../db/entity').entity,
		clause = require('../db/entity').clause,

tag = function () {
	var base = Object.create(entity, {kind: {value: 'tags'}}),
			self = Object.create(base);

	// adds one tag to the file
	self.add = function (after, filter, mediaids, where, handler) {
		var tmp = after.tag.split(':'),
				name = "'" + tmp[0] + "'",
				kind = tmp[1] ? "'" + tmp[1] + "'" : "NULL",

		statement = (typeof after.mediaid !== 'undefined' && after.mediaid !== null ? [
			"INSERT OR IGNORE INTO",
			self.kind,
			"(mediaid, name, kind) VALUES",
			"(" + [after.mediaid, name, kind].join(',') + ")"
		] : [
			"INSERT OR IGNORE INTO",
			self.kind,
			"(mediaid, name, kind)",
			["SELECT mediaid", name, kind].join(","),
			"FROM", self.kind,
			"WHERE 1",
			mediaids ?
				$media.selection(mediaids) :
				filter ?
					$media.filter(filter) : 
					"",
			where ?
				"AND " + where :
				""
		]).join(" ");
				
		if (handler) {
			console.log(statement);
			db.nonQuery(statement, handler);
			return self;
		} else {
			return statement;
		}
	};
	
	// updates a batch of tags
	self.set = function (before, after, handler) {
		// separating tag name and kind
		before.name = before.tag.split(':')[0];
		delete before.tag;
		
		var	where =  clause(before, true).join(" AND "),
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
		db.nonQuery(statement, handler);
	};
	
	// removes tag from file(s)
	self.remove = function (before, filter, mediaids, where, handler) {
		var mediaid = before.mediaid,
				tmp = before.tag.split(':'),
				name = tmp[0],
				clause = mediaids ?
					$media.selection(mediaids) :
					filter ?
						$media.filter(filter) :
						"",

		statement = [
			"DELETE FROM", self.kind,
			"WHERE 1",
			clause,
			"AND name = '" + name + "'",
			mediaid ?
				"AND mediaid = " + mediaid :
				"",
			where ?
				"AND " + where :
				""
		].join(" ");

		if (handler) {
			console.log(statement);
			db.nonQuery(statement, handler);
			return self;
		} else {
			return statement;
		}
	};

	// explodes tag
	self.explode = function (before, filter, mediaids, handler) {
		var tmp = before.tag.split(':'),
				where = "name = '" + tmp[0] + "'",
				names = tmp[0].split(' '),
				kind = tmp[1] || '',

		statement = [
			"BEGIN TRANSACTION",
			// adds exploded tags
			(function () {
				var i, name, statement = [];
				for (i = 0; i < names.length; i++) {
					name = names[i];
					if (!name.length) {
						continue;
					}
					statement.push(self.add({
						mediaid: before.mediaid,
						tag: name + ':' + kind
					}, filter, mediaids, where));
				}
				return statement.join(";\n");
			}()),
			// removes old tag
			self.remove(before, filter, mediaids),
			"END TRANSACTION"
		].join(";\n");
		
		console.log(statement);
		db.nonQuery(statement, handler);
	};
	
	return self;
}();

exports.tag = tag;

