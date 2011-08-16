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
		paths = paths && paths.length ? paths : ['media']; 
		var i, root,
				dirs = {};
		function handler(relative, stats) {
			datastore.set.call(dirs, (root + relative).split('/').slice(1), {});
		}
		for (i = 0; i < paths.length; i++) {
			root = '/' + paths[i];
			walker(handler).walkSync(root, 3);
		}
		if (paths.length > 1) {
			// returning absolute tree when more than one roots were specified
			return dirs;
		} else {
			// returning relative tree when only one root was given
			return datastore.get.call(dirs, paths[0].split('/'));
		}
	}
};

exports.system = system;

