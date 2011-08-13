////////////////////////////////////////////////////////////////////////////////
// System
//
// System operations
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	walker = require('utils/walker').walker,
		datastore = require('utils/datastore').datastore,
		
system = {
	// returns a directory tree relative to the specified path
	// in 3 folders depth
	// - path: path to get tree for
	tree: function (path) {
		var root = '/' + (path || 'media'),
				dirs = {};
		walker(function (relative, stats) {
			datastore.set.call(dirs, (root + relative).split('/').slice(1), {});
		}).walkSync(root, 3);
		return dirs;
	}
};

exports.system = system;

