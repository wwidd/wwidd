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
			var	metadata = { },
					count = 0;
			
			// walking library root synchronously
			count = 0;
			walker(
				// called on each directory
				null,
				// called on each file
				function (filePath) {
					// increasing counter
					if (!metadata.hasOwnProperty(filePath)) {
						// only unique keys (filePath) count
						count++;
					}
					metadata[filePath] = {};
				}
			).walkSync(path);
			
			// continuation - adds collected data to database
			handler(metadata, count);
			
			return self;
		},
		
		// ingests suitable files into the library
		add: function (handler) {
			console.log("ROOT - initializing...");
			entity.add({'path': path}, function () {
				entity.get({'path': path}, function (data) {
					var rootid = data[0].rootid;
					console.log("ROOT - initialized: " + rootid);
					console.log("ROOT - ingesting video metadata into library");
					self.scan(function (metadata, count) {
						// ending request and returning when nothing found
						if (count === 0) {
							if (handler) {
								handler(metadata);
							}
							return;
						}

						// acquiring existing media entries
						library.getPaths(rootid, function (data) {
							var result,
									i;
							
							// filtering out existing media ids from metadata
							for (i = 0; i < data.length; i++) {
								delete metadata[data[i].path];
							}
							
							// initializing input for library.fill()
							result = {};
							result[rootid] = metadata;
							
							// filling library with pure names (auto tags)
							// when this is done, the HTTP response ends: the rest is async
							library.fill(result, {keywords: false}, function () {
								if (handler) {
									handler(metadata);
								}
							});
						});
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

