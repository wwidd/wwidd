////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
var	root = require('../logic/root').root,
		entity = require('../db/library').library,
		tag = require('../db/tag').tag,

library = function () {
	var json;
	
	// splits tags along commas
	function splitTags(data) {
		var i;
		for (i = 0; i < data.length; i++) {
			data[i].tags = data[i].tags.split(',');
		}
	}
	
	self = {
		// queries all media entries
		getMedia: function (filter, handler) {
			entity.getMedia(filter, function (data) {
				splitTags(data);
				handler(data);
			});
			return self;
		},
		
		// queries tag kinds in database
		getKinds: function (handler) {
			tag.getKinds(handler);
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

