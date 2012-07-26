////////////////////////////////////////////////////////////////////////////////
// Thumbnail
//
// Generates thumbnail images for video files
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var $fs = require('fs'),
    ffmpeg = require('../tools/ffmpeg').ffmpeg,
    thumb;

thumb = function () {
    var self,
        cachePath = 'server/cache/';

    // create cache dir if doesn't exist
    if (!$fs.existsSync(cachePath)) {
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
            // generating thumbnail
            ffmpeg.exec(inPath, outPath, 1, handler);
        }
    };

    return self;
}();

// exports
exports.thumb = thumb;

