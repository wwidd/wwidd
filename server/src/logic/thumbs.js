////////////////////////////////////////////////////////////////////////////////
// Thumbnails
//
// Manages cached thumbnails
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$crypto = require('crypto'),
		entity = require('../db/media').media,
		thumb = require('../logic/thumb').thumb,
		
thumbs = function () {	
	var media = entity(),
	
	self = {
		// generates thumbnails for video files
		// identified by their mediaid's
		// - mediaids: media ids to generate thumbnail for
		generate: function (mediaids, handler) {
			media.multiGet(mediaids, function (data) {
				// collecting hashes
				var result = {},
						i, entry,
						shasum;
				for (i = 0; i < data.length; i++) {
					entry = data[i];
					// generating hash when necessary
					if (!entry.hash.length) {
						shasum = $crypto.createHash('md5');
						shasum.update(entry.path);
						result[entry.mediaid] = {
							hash: shasum.digest('hex')
						};
					}
				}	
				
				// updating hashes in DB, no need to wait to return
				media.multiSet(result, handler);
				
				// ---- request ends here, rest is background
				
				// saving thumbnails
				i = 0;
				function next() {
					var hash;
					if (i++ >= data.length) {
						return;
					} else {
						entry = data[i];
						hash = result[entry.mediaid].hash;
						console.log("THUMBS - generating thumbnail: " + hash);
						thumb.generate(entry.root + entry.path, hash, next);
					}
				}
				next();
			});
		}
	};
	
	return self;
}();

// exports
exports.thumbs = thumbs;

