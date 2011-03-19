////////////////////////////////////////////////////////////////////////////////
// Library Root Path - Business Logic
//
// Ingests metadata from media files.
////////////////////////////////////////////////////////////////////////////////
var	library = require('../db/library').library,
		entity = require('../db/root').root,
		extract = require('../tools/extract').extract,
		walker = require('../utils/walker').walker,

// - path: root path
root = function (path) {
	var self = {
		// scans the library and returns metadata for relevant files
		scan: function (handler, extract) {
			var	list = [],
					metadata = { },
					fileCount = 0;
	
			// walking library root synchronously
			walker(
				// called on each directory
				null,
				// called on each file
				function (filePath) {
					list.push(filePath);
					metadata[filePath] = {};
				}
			).walkSync(path);
			
			if (!extract) {
				handler(metadata);
			} else {
				// CPS async tool starter
				// (async execution of extraction tool(s))
				(function next(filePath) {
					// calling extract
					if (fileCount++ % 10 === 0) {
						process.stdout.write(".");
					}
					extract.exec(filePath, ['--verbose', '--filename'], function (data) {
						var	keywords = data[0];
						if (keywords) {
							metadata[filePath] = keywords;
						}
						// exec next path in list
						if (list.length) {
							next(list.shift());
						} else if (handler) {
							process.stdout.write("\n");
							handler(metadata);
						}
					});
				})(list.shift());
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

