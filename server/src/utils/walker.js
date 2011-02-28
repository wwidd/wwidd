////////////////////////////////////////////////////////////////////////////////
// Directory Walker
//
// Walks directories recursively and executes handlers on each object.
// Only synchronous walking is supported because async can only be done
// with CPS (continuation-passing style), which is complicated and adds
// restrictions to the callbacks.
////////////////////////////////////////////////////////////////////////////////
var	$fs = require('fs'),

// - dirHandler: called for each directory
// - fileHandler: called for each file
// - options: various options, eg. filename filter
walker = function (dirHandler, fileHandler, options) {
	// defaults
	dirHandler = dirHandler || function () { };
	fileHandler = fileHandler || function () { };
	options = options || { filter: new RegExp('^.+\\.(wmv|avi|mov|mp4)$', 'ig') };

	var self = {
		// synchronous directory walking
		// when the function returns, the whole process has completed
		walkSync: function (root) {
			var	fileCount = 0;
			
			// recursive inner function
			console.log(["Walking path '", root, "'..."].join(''));
			(function walk(path) {
				var	i,
						files,
						stats = $fs.lstatSync(path);
	
				if (stats.isDirectory()) {
					// calling directory callback
					dirHandler(path, stats);
					
					// listing directories
					files = $fs.readdirSync(path);
					for (i = 0; i < files.length; i++) {
						walk([path, '/', files[i]].join(''));
					}
				} else if (stats.isFile()) {
					// calling file handler
					if (path.match(options.filter)) {
						fileCount++;
						fileHandler(path, stats);
					}
				}
			})(root);
			console.log(["Path '", root, "' walked: ", fileCount, " files."].join(''));
			
			return self;
		}
	};
	
	return self;
};

// exports
exports.walker = walker;

