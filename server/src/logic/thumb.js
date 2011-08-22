////////////////////////////////////////////////////////////////////////////////
// Thumbnail
//
// Generates thumbnail images for video files
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$fs = require('fs'),
		$path = require('path'),
		ffmpeg = require('../tools/ffmpeg').ffmpeg,
		
thumb = function () {
	var self,
			cachePath = 'server/cache/';
			
	// create cache dir if doesn't exist
	if (!$path.existsSync(cachePath)) {
		$fs.mkdirSync(cachePath, '0777');
	}
	
	self = {
		// generates thumbnail for video
		// - path: media path relative to root
		generate: function (path, hash) {
			// checking if thumbnail is already there				
			var inPath = path,
					outPath = cachePath + hash + '.jpg';
			if (!$path.existsSync(outPath)) {
				// generating thumbnail
				console.log("THUMB - generating thumbnail for: " + inPath + " at: " + outPath);					
				ffmpeg.thumb(inPath, outPath, 1, function (data) {
					console.log("THUMB - thumbnail saved: " + hash);
				});
			}
		}
	};
	
	return self;
}();

// exports
exports.thumb = thumb;

