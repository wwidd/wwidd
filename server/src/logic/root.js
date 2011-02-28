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
		scan: function (handler) {
			var	list = [],
					metadata = { };
	
			// walking library root synchronously
			walker(
				// called on each directory
				null,
				// called on each file
				function (filePath) {
					list.push(filePath);
				}
			).walkSync(path);
			
			// CPS async tool starter
			// (async execution of extraction tool(s))
			(function next(filePath) {
				// calling extract
				extract.exec(filePath, ['--verbose', '--filename'], function (data) {
					var	keywords = data[0];
					if (keywords) {
						metadata[filePath] = keywords;
					}
					// exec next path in list
					if (list.length) {
						next(list.shift());
					} else if (handler) {
						handler(metadata);
					}
				});
			})(list.shift());
	
			return self;
		},
		
		// ingests suitable files into the library
		add: function (handler) {
			console.log("Initializing library root...");
			entity.add({'path': path}, function () {
				console.log("Library root initialized.");
				console.log("Ingesting video metadata into library...");
				self.scan(function (metadata) {
					library.fill(metadata, function () {
						console.log("Video metadata ingested.");
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

