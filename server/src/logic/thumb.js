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
		// - name: thumbnail file name
		generate: function (path, name, handler) {
			// checking if thumbnail is already there				
			var inPath = path,
					outPath = cachePath + name + '.jpg';
			if (!$path.existsSync(outPath)) {
				// generating thumbnail
				ffmpeg.thumb(inPath, outPath, 1, handler);
			} else if (handler) {
				handler(false);
			}
		}
	};
	
	return self;
}();

// exports
exports.thumb = thumb;

