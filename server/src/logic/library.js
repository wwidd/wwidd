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
		processes = require('../logic/processes').processes,
		system = require('../utils/system').system,
		cygpath = require('../tools/cygpath').cygpath,
		sqlite = require('../tools/sqlite').sqlite,
		walker = require('../utils/walker').walker,

library = function () {
	var json, self;
	
	// splits properties along characters
	function split(data, property, separator) {
		var i, tmp;
		for (i = 0; i < data.length; i++) {
			tmp = data[i][property];
			data[i][property] = tmp.length ? tmp.split(separator) : [];
		}
	}

	self = {
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
				selected: sqlite.db(),
				processes: processes.poll()
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
			if (system.os === 'cygwin') {
				cygpath.exec(path, function (wpath) {
					root(wpath).add(handler);
				});
			} else {
				root(path).add(handler);
			}
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

