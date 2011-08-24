////////////////////////////////////////////////////////////////////////////////
// Thumbnails
//
// Manages cached thumbnails
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$crypto = require('crypto'),
		entity = require('../db/media').media,
		thumb = require('../logic/thumb').thumb,
		queue = require('../utils/queue').queue,
		
thumbs = function () {	
	var media = entity(),
			process,
	
	self = {
		// generates thumbnails for video files
		// identified by their mediaid's
		// - mediaids: media ids to generate thumbnail for
		generate: function (mediaids, handler) {
			media.multiGet(mediaids, function (data) {
				// collecting hashes
				var i, entry,
						shasum;

				// stopping previous process
				if (process) {
					process
						.clear();
				}

				process = queue(function (elem, finish) {
					var tmp = elem.split('|'),
							entry = {mediaid: tmp[0], root: tmp[1], path: tmp[2], hash: tmp[3]};
					console.log("THUMBS - generating thumbnail: " + entry.hash);
					thumb.generate(entry.root + entry.path, entry.hash, function (created) {
						finish(entry);
					});
				});
				
				// collecting necessary hashes
				for (i = 0; i < data.length; i++) {
					entry = data[i];
					if (!entry.hash.length) {
						shasum = $crypto.createHash('md5');
						shasum.update(entry.path);
						entry.hash = shasum.digest('hex');
						process.add(entry.mediaid + '|' + entry.root + '|' + entry.path + '|' + entry.hash);
					}
				}

				// (re-)starting thumbnail generation process
				process
					.onFinished(function (result) {
						// assembling hash update
						var after = {},
								i, entry;
						for (i = 0; i < result.length; i++) {
							entry = result[i];
							after[entry.mediaid] = {
								hash: entry.hash
							};
						}
						
						// updating hashes
						media.multiSet(after, function () {
							// returning to caller process
							// (ending request when called from service)
							if (handler) {
								handler(after);
							}
						});
					})
					.start(true);
			});
		}
	};
	
	return self;
}();

// exports
exports.thumbs = thumbs;

