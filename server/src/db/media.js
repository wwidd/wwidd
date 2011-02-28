////////////////////////////////////////////////////////////////////////////////
// Media Entity
////////////////////////////////////////////////////////////////////////////////
var	entity = require('../db/entity').entity,

media = function (path) {
	var self = Object.create(entity, {kind: {value: 'media'}});

	self.get = function (handler) {
		entity.get(path ? {'path': path} : null, handler, self);
	};
	
	self.set = function (before, after, handler) {
		before = before || {};
		if (path) {
			if (parseInt(path)) {
				before.mediaid = path;
			} else {
				before.path = path;
			}
		}
		entity.set(before, after, handler, self);
	};
	
	return self;
};

exports.media = media;

