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
		scan: function (handler) {
			var	metadata = { };
			
			// clearing process chains
			processes.extractor.clear();
					
			// walking library root synchronously
			walker(
				// called on each directory
				null,
				// called on each file
				function (filePath) {
					processes.extractor.add(filePath);
					metadata[filePath] = {};
				}
			).walkSync(path);
			
			// continuation - adds collected data to database
			handler(metadata);
			
			return self;
		},
		
		// ingests suitable files into the library
		add: function (handler) {
			console.log("Initializing library root...");
			entity.add({'path': path}, function () {
				console.log("Library root initialized.");
				console.log("Ingesting video metadata into library");
				self.scan(function (metadata) {
					// filling library with pure names (auto tags)
					// when this is done, the HTTP response ends: the rest is async
					library.fill(metadata, function () {
						if (handler) {
							handler(metadata);
						}
						
						var batch = {},		// batch of metadata
								counter = 0;	// batch counter
						
						// flushes batch of metadata to database
						function flush() {
							library.fill(batch);
							counter = 0;
							batch = {};
						}
								
						// extracting metadata from files and updating database
						processes.extractor
							.onFinished(function (result) {
								// flushing remainder
								flush();
							})
							.onProgress(function (elem) {
								batch[elem.path] = elem.keywords;
								if (++counter === 100) {
									flush();
								}
							})
							.start(true);					
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

