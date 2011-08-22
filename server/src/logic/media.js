////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	vlc = require('../tools/vlc').vlc,
		entity = require('../db/media').media,
		thumbs = require('../logic/thumbs').thumbs,
		
media = function (mediaid) {
	var self = {
		// queries media information
		get: function (handler) {
			entity(mediaid).get(handler);
		},
		
		// plays back a video
		play: function (handler) {
			self.get(function (data) {
				// saving thumbnail
				thumbs.generate([mediaid]);
				// starting playback
				var path = data[0].root + data[0].path;
				console.log("MEDIA - starting playback of file: " + path);
				vlc.exec(path, function (path) {
					console.log("MEDIA - playback finished or interrupted");
				});
				// not waiting for playback to finish
				if (handler) {
					handler(path);
				}
			});
			return self;
		},
		
		// rates media file
		rate: function (rating, handler) {
			console.log("MEDIA - rating media: " + mediaid + " at: " + rating);
			entity(mediaid).set({rating: rating}, handler);
			return self;
		}
	};
	
	return self;
};

// exports
exports.media = media;

