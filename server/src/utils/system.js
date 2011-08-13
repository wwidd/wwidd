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
	// - paths: array of paths to get directory trees for
	tree: function (paths) {
		var i, root,
				dirs = {};
		function handler(relative, stats) {
			datastore.set.call(dirs, (root + relative).split('/').slice(1), {});
		}
		for (i = 0; i < paths.length; i++) {
			root = '/' + (paths[i] || 'media');
			walker(handler).walkSync(root, 3);
		}
		return dirs;
	}
};

exports.system = system;

