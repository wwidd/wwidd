////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	$path = require('path'),
		root = require('../logic/root').root,
		db = require('../db/db').db,
		entity = require('../db/library').library,
		tag = require('../db/tag').tag,
		sqlite = require('../tools/sqlite').sqlite,
		walker = require('../utils/walker').walker,

library = function () {
	var json, self;
	
	// splits properties along characters
	function split(data, property, separator) {
		var i;
		for (i = 0; i < data.length; i++) {
			data[i][property] = data[i][property].split(separator);
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
			return {
				names: names,
				selected: sqlite.db()
			};
		},
		
		// sets library (sqlite db file) to use
		set: function (name, handler) {
			db.name(name, handler);
			return self;
		},
		
		// queries all media entries
		getMedia: function (filter, handler) {
			entity.getMedia(filter, function (data) {
				split(data, 'tags', ',');
				split(data, 'keywords', ',');
				handler(data);
			});
			return self;
		},
		
		// queries all tags
		getTags: function (handler) {
			tag.getTags(handler);
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

