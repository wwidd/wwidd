////////////////////////////////////////////////////////////////////////////////
// System
//
// System operations
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$os = require('os'),
		walker = require('./walker').walker,
            flock = require('flock-0.1.3').flock,

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
				dirs = flock();

		// default root paths
		if (empty) {
			paths = {
				'linux': ['home', 'media'],
				'freebsd': ['home', 'media'],
				'cygwin': ['cygdrive'],
				'darwin': ['Users', 'Volumes']
			}[os] || ['home'];
		}
		
		// walker handler
		function handler(relative, stats) {
			dirs.set((root + relative).split('/').slice(1), {});
		}
		
		// gathering directory structure
		for (i = 0; i < paths.length; i++) {
			root = '/' + paths[i];
			walker(handler).walkSync(root, 2);
		}
		
		if (empty) {
			// returning absolute tree on dafault root
			return dirs.root();
		} else {
			// returning relative tree when only one root was given
			return dirs.get(paths[0].split('/'));
		}
	}
};

console.log("SYSTEM - OS type: " + os);

exports.system = system;

