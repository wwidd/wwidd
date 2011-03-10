////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
var	$path = require('path'),
		root = require('../logic/root').root,
		entity = require('../db/library').library,
		tag = require('../db/tag').tag,
		sqlite = require('../tools/sqlite').sqlite,
		walker = require('../utils/walker').walker,

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
		// creates a new library
		// (doesn't check whether it already exists)
		create: function (name, handler) {
			sqlite
				.db(name)
				.exec('create.sql', handler);
			return self;
		},
		
		// lists available library names
		list: function () {
			var names = [];
			walker(null, function (path, stats) {
				names.push($path.basename(path, '.sqlite'));
			}, {
				filter: new RegExp('^.+\\.sqlite$', 'ig')
			}).walkSync(sqlite.path());
			return names;
		},
		
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

