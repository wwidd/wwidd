////////////////////////////////////////////////////////////////////////////////
// Media Entity
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	entity = require('../db/entity').entity,

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
		"WHERE",
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
		"WHERE mediaid IN (",
		tmp.join(","),
		")"
	].join(" ");
},

media = function (path) {
	var self = Object.create(entity, {kind: {value: 'media'}});

	self.get = function (handler) {
		entity.get(path ? {'path': path} : null, handler, self);
	};
	
	self.set = function (before, after, handler) {
		before = before || {};
		if (path) {
			if (parseInt(path, 10)) {
				before.mediaid = path;
			} else {
				before.path = path;
			}
		}
		entity.set(before, after, handler, self);
	};
	
	return self;
};

exports.filter = filter;
exports.selection = selection;
exports.media = media;

