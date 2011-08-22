////////////////////////////////////////////////////////////////////////////////
// Thumbnails
//
// Manages cached thumbnails
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$crypto = require('crypto'),
		entity = require('../db/media').media,
		thumb = require('../logic/thumb').thumb,
		chain = require('../utils/chain').chain,
		
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
						shasum,
				
				// thumbnail generating process
				process = chain(function (elem, finish) {
					var tmp = elem.split('|'),
							entry = {root: tmp[0], path: tmp[1], hash: tmp[2]};
					console.log("THUMBS - generating thumbnail: " + entry.hash);
					thumb.generate(entry.root + entry.path, entry.hash, finish);
				});

				// collecting necessary hashes
				for (i = 0; i < data.length; i++) {
					entry = data[i];
					if (!entry.hash.length) {
						shasum = $crypto.createHash('md5');
						shasum.update(entry.path);
						entry.hash = shasum.digest('hex');
						result[entry.mediaid] = {
							hash: entry.hash
						};
						process.add(entry.root + '|' + entry.path + '|' + entry.hash);
					}
				}

				// starting thumbnail generation process
				process
					.onFinished(function () {
						media.multiSet(result, handler);
					})
					.start(true);
			});
		}
	};
	
	return self;
}();

// exports
exports.thumbs = thumbs;

