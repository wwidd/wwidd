////////////////////////////////////////////////////////////////////////////////
// Library Root Path - Business Logic
//
// Ingests metadata from media files.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, process, console */
var	library = require('../db/library').library,
		entity = require('../db/root').root,
		walker = require('../utils/walker').walker,
		processes = require('../logic/processes').processes,
		
// - path: root path
root = function (path) {
	var self = {
		// scans the library and returns metadata for relevant files
		scan: function (handler, extract) {
			var	extractor,				// chain
					metadata = { },
					fileCount = 0;
	
			extractor = processes.extractor;
					
			// walking library root synchronously
			walker(
				// called on each directory
				null,
				// called on each file
				function (filePath) {
					extractor.add(filePath);
					metadata[filePath] = {};
				}
			).walkSync(path);
			
			// extracting keywords
			if (!extract) {
				handler(metadata);
			} else {
				extractor
					.onFinished(function (result) {
						var i;
						for (i = 0; i < result.length; i++) {
							metadata[result[i].path] = result[i].keywords;
						}
						handler(metadata);
					})
					.onProgress(function () {
						if (fileCount++ % 10 === 0) {
							process.stdout.write(".");
						}
					})
					.start(true);
			}
			
			return self;
		},
		
		// ingests suitable files into the library
		add: function (handler) {
			console.log("Initializing library root...");
			entity.add({'path': path}, function () {
				console.log("Library root initialized.");
				console.log("Ingesting video metadata into library");
				self.scan(function (metadata) {
					library.fill(metadata, function () {
						if (handler) {
							handler(metadata);
						}
					});
				});
			});
			
			return self;
		}
	};
	
	return self;
};

// exports
exports.root = root;

