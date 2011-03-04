////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
var	root = require('../logic/root').root,
		entity = require('../db/library').library,

library = function () {
	var json;
	
	// splits tags along commas
	function splitTags(data) {
		var i;
		for (i = 0; i < data.length; i++) {
			data[i].tags = data[i].tags.split(',');
		}	
	}
	
	function checkAll(data, kind, handler) {
		json[kind] = data;
		if (json.media && json.kinds) {
			handler(json);
		}
	}
	
	self = {
		// queries the entire database
		getAll: function (handler) {
			json = {};
			entity.getAll(function (data) {
				splitTags(data);
				checkAll(data, 'media', handler);
			});
			entity.getKinds(function (data) {
				checkAll(data, 'kinds', handler);
			});
			return self;
		},
		
		// adds a root path to the library
		addRoot: function (path, handler) {
			root(path).add(handler);
			return self;
		},
		
		// adds a file path to the library
		addFile: function (path, handler) {
			throw "Unimplemented";
		}
	};
	
	return self;
}();

// exports
exports.library = library;

