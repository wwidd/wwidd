////////////////////////////////////////////////////////////////////////////////
// Media Entity
////////////////////////////////////////////////////////////////////////////////
var	entity = require('../db/entity').entity,

// constructs a where clause that will retrieve
// media records filtered by tags
filter = function (tags, inclusive) {
	var names = tags.split(/\s*[^A-Za-z0-9:\s]+\s*/),
			clause = [],
			i;
	for (i = 0; i < names.length; i++) {
		clause.push("name LIKE '" + names[i] + "%'");
	}
	return [
		"WHERE mediaid IN (",		
		"SELECT mediaid FROM tags WHERE",
		clause.join(" OR "),
		"GROUP BY mediaid HAVING count(name) =",
		inclusive ? 1 : names.length,
		")"
	].join(" ");
};

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
exports.media = media;

