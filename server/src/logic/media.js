////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$path = require('path'),
		vlc = require('../tools/vlc').vlc,
		entity = require('../db/media').media,

media = function (mediaid) {
	var self = {
		// queries media information
		get: function (handler) {
			entity(mediaid).get(handler);
		},
		
		// plays back a video
		play: function (handler) {
			self.get(function (data) {
				var path = data[0].root + data[0].path;
				console.log("MEDIA - starting playback of file: " + path);
				vlc.exec('vlc', ['-vvv', path], function (path) {
					console.log("MEDIA - playback finished or interrupted");
				});			
				// not waiting for playback to finish
				if (handler) {
					handler(path);
				}
			});
			return self;
		},
		
		rate: function (rating, handler) {
			console.log("MEDIA - rating media: " + mediaid + " at: " + rating);
			entity(mediaid).set(null, {rating: rating}, handler);
			return self;
		}
	};
	
	return self;
};

// exports
exports.media = media;

