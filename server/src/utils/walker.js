////////////////////////////////////////////////////////////////////////////////
// Directory Walker
//
// Walks directories recursively and executes handlers on each object.
// Only synchronous walking is supported because async can only be done
// with CPS (continuation-passing style), which is complicated and adds
// restrictions to the callbacks.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, process, console */
var	$fs = require('fs'),

// - dirHandler: called for each directory
// - fileHandler: called for each file
// - options:
//   - filter: regex for filtering file names
walker = function (dirHandler, fileHandler, options) {
	// defaults
	dirHandler = dirHandler || function () { };
	fileHandler = fileHandler || function () { };
	options = options || { filter: new RegExp('^.+\\.(wmv|avi|mov|mp4|mkv|webm|flv|ogv|mpeg|3gp|divx)$', 'ig'), hidden: false };

	var self = {
		// synchronous directory walking
		// when the function returns, the whole process has completed
		// - root: root path
		// - maxDepth: maximum depth
		walkSync: function (root, maxDepth) {
			var	fileCount = 0,
					hasMaxDepth = typeof maxDepth !== 'undefined';
			
			// recursive inner function
			// - relative: path relative to root
			console.log("WALKER - walking path: " + root + (hasMaxDepth ?  ", max depth: " + maxDepth : ""));
			
			(function walk(relative, depth) {
				if (++fileCount % 16 === 0) {
					process.stdout.write(".");
				}

				var	i,
						files,
						path = root + relative,
						stats;
				
				// obtaining file stats
				try {		
					stats = $fs.lstatSync(path);
				} catch (e_exist) {
					throw "The specified path: " + path + " doesn't exist or is inaccessible.";
				}
	
				if (stats.isDirectory()) {
					// listing directory
					try {
						files = $fs.readdirSync(path);
					} catch (e_perm) {
						// returning on insufficient permissions
						return;
					}

					// calling directory callback
					dirHandler(relative, stats);

					// processing directory contents					
					for (i = 0; i < files.length; i++) {
						// optionally excluding hidden files
						if ((options.hidden || files[i][0] !== '.') &&
							(!hasMaxDepth || depth < maxDepth)) {
							walk(relative + '/' + files[i], depth + 1);
						}
					}
				} else if (stats.isFile()) {
					// calling file handler
					if (path.match(options.filter)) {
						fileHandler(relative, stats);
					}
				}
			})('', 0);
			
			if (fileCount > 16) {
				process.stdout.write("\n");
			}
			
			return self;
		}
	};
	
	return self;
};

// exports
exports.walker = walker;

