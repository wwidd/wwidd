////////////////////////////////////////////////////////////////////////////////
// Thumbnail
//
// Manages cached thumbnails
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$crypto = require('crypto'),
		$fs = require('fs'),
		$path = require('path'),
		ffmpeg = require('../tools/ffmpeg').ffmpeg,
		entity = require('../db/media').media,
		
thumb = function (mediaid) {
	var media = entity(mediaid),
			self,
			path, hash,
			cachePath = 'server/cache/';
			
	// create cache dir if doesn't exist
	if (!$path.existsSync(cachePath)) {
		$fs.mkdirSync(cachePath, '0777');
	}
	
	self = {
		// generates thumbnail for video
		// - path: media path relative to root
		generate: function () {
			media.get(function (data) {
				var inPath = data[0].root + data[0].path,
						outPath,
						hash = data[0].hash,
						shasum;
						
				// generating hash when necessary
				if (!hash.length) {
					shasum = $crypto.createHash('md5');
					shasum.update(data[0].path);
					hash = shasum.digest('hex');
					// updating hash in DB, no need to wait to return
					media.set({hash: hash});
				}
							
				// checking if thumbnail is already there				
				outPath = cachePath + hash + '.jpg';
				if (!$path.existsSync(path)) {
					// generating thumbnail
					console.log("THUMB - generating thumbnail for: " + inPath + " at: " + outPath);					
					ffmpeg.thumb(inPath, outPath, 1, function (data) {
						console.log(data);
						console.log("THUMB - thumbnail saved: " + hash);
					});
				}
			});
		}
	};
	
	return self;
};

// exports
exports.thumb = thumb;

