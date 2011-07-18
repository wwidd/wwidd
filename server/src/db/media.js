////////////////////////////////////////////////////////////////////////////////
// Media Entity
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	entity = require('../db/entity').entity,
		sqlite = require('../tools/sqlite').sqlite, 

// constructs a where clause that will retrieve
// media records filtered by tags
filter = function (tags, table) {
	var names = tags.split(/\s*[^A-Za-z0-9:\s]+\s*/),
			clause = [],
			i;
	for (i = 0; i < names.length; i++) {
		clause.push("',' || group_concat(name) LIKE '%," + names[i] + "%'");
	}
	return [
		"AND",
		(table ? table + '.' : '') + "mediaid IN (",
		"SELECT mediaid FROM tags",
		"GROUP BY mediaid",
		"HAVING",
		clause.join(" AND "),
		")"
	].join(" ");
},

// constructs a where clause that will retrieve
// media records by their id
selection = function (mediaids) {
	var tmp = mediaids.split(/[^0-9]+/);
	return [
		"AND mediaid IN (",
		tmp.join(","),
		")"
	].join(" ");
},

media = function (mediaid) {
	var self = Object.create(entity, {kind: {value: 'media'}});

	self.get = function (handler) {
		var statement = [
			"SELECT mediaid, roots.path AS root, media.path AS path, hash",
			"FROM media",
			"JOIN roots USING (rootid)",
			"WHERE mediaid =", mediaid
		].join(" ");
		console.log(statement);
		sqlite.exec(statement, handler, ['-header', '-line']);
	};
	
	self.set = function (before, after, handler) {
		before = before || {};
		before.mediaid = mediaid;
		entity.set.call(self, before, after, handler);
	};
	
	return self;
};

exports.filter = filter;
exports.selection = selection;
exports.media = media;

