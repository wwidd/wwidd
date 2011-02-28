////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
var	root = require('../logic/root').root,
		entity = require('../db/library').library,

library = function () {
	self = {
		// queries the entire database
		getAll: function (handler) {
			entity.getAll(handler);
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

