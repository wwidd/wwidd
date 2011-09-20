////////////////////////////////////////////////////////////////////////////////
// System
//
// System operations
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$os = require('os'),
		walker = require('utils/walker').walker,
		datastore = require('utils/datastore').datastore,

os = $os.type().split(/[^A-Za-z0-9]+/)[0].toLowerCase(),
		
system = {
	// os type
	os: os,
	
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
				'cygwin': ['cygdrive'],
				'darwin': ['Users', 'Volumes']
			}[os] || ['home'];
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

console.log("SYSTEM - OS type: " + os);

exports.system = system;

