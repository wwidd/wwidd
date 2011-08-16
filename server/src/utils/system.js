////////////////////////////////////////////////////////////////////////////////
// System
//
// System operations
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	tool = require('tools/tool').tool,
		walker = require('utils/walker').walker,
		datastore = require('utils/datastore').datastore,
		
system = {
	// returns a directory tree relative to the specified path
	// in 3 folders depth
	// - paths: array of paths to get directory trees for
	tree: function (paths) {
		var i, root,
				empty = !paths || !paths.length,
				dirs = {};

		// default root paths
		if (empty) {
			paths = {
				'linux': ['home', 'media'],
				'cygwin': ['cygdrive']
			}[tool.os] || ['home'];
		}
		
		// walker handler
		function handler(relative, stats) {
			datastore.set.call(dirs, (root + relative).split('/').slice(1), {});
		}
		
		// gathering directory structure
		for (i = 0; i < paths.length; i++) {
			root = '/' + paths[i];
			walker(handler).walkSync(root, 2);
		}
		
		if (empty) {
			// returning absolute tree on dafault root
			return dirs;
		} else {
			// returning relative tree when only one root was given
			return datastore.get.call(dirs, paths[0].split('/'));
		}
	}
};

exports.system = system;

