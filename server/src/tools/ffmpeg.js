////////////////////////////////////////////////////////////////////////////////
// ffmpeg tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$path = require('path'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,

ffmpeg = function () {
	// inheriting from tool
	var

	customParser = Object.create(parser, {
		fieldSeparator: {value: new RegExp(tool.lineBreak + '\\s*')},
		keySeparator: {value: /\s*:\s*/},
		fieldSkip: {value: 1}
	}),
	
	durationParser = Object.create(parser, {
		fieldSeparator: {value: /,\s*/},
		keySeparator: {value: /\s*:\s+/}
	}),
	
	self = Object.create(tool, {
		executable: {value: 'ffmpeg'},
		stderr: {value: true}
	});

	// extracts metadata from media file
	self.metadata = function (path, handler) {
		tool.exec.call(self, ['-i', path], function (data) {
			console.log(data);
		});
	};
	
	// parses ffmpeg output
	function parse(stdout, handler) {
		// parsing ffmpeg output
		var	chapters = stdout.split(/\n+(?=\w)/),
				i, chapter,
				subchapters, j, subchapter,
				rows, k, row,
				l, properties, tmp,
				metadata = [];
		for (i = 0; i < chapters.length; i++) {
			chapter = chapters[i];
			if (chapter.match(/^Input\s#/)) {
				// input chapter
				// subchapters: Metadata and Duration
				subchapters = chapter.split(new RegExp(tool.lineBreak + '+\\s{2}(?=\\w)'));
				for (j = 0; j < subchapters.length; j++) {
					subchapter = subchapters[j];
					if (subchapter.match(/^Metadata:/)) {
						// metadata subchapter
						metadata = metadata.concat(customParser.parse(subchapter));
					} else if (subchapter.match(/^Duration:/)) {
						// duration subchapter
						rows = subchapter.split(new RegExp(tool.lineBreak + '\\s*'));
						// duration, start, bitrate
						metadata = metadata.concat(durationParser.parse(rows[0]));
						for (k = 1; k < rows.length; k++) {
							row = rows[k];
							// stream data
							if (row.match(/^Stream\s#([^:]*):/)) {
								row = row.substr(row.search(/(Audio|Video):/));
								if (row.match(/^Audio:/)) {
									// audio channel
									row = row.substr('Audio: '.length).split(/,\s*/);
									metadata.push({
										codec: row[0],
										sampling: row[1],
										channels: row[2],
										bps: row[3],
										bitrate: row[4]
									});
								} else if (row.match(/^Video:/)) {
									// video channel
									row = row.substr('Video: '.length).split(/,\s*/);
									properties = {
										codec: row[0],
										format: row[1],
										dimensions: row[2]
									};
									for (l = 3; l < row.length; l++) {
										tmp = row[l].split(' ');
										properties[tmp[1]] = tmp[0];
									}
									metadata.push(properties);
								}
							} 
						}
					}
				}
				break;
			}
		}
		// passing on results
		handler(metadata);
	}
	
	// extracts thumbnail(s) from media file
	self.thumb = function (inPath, outPath, count, handler) {
		// check if thumbnail exists
		tool.exec.call(self, [
			'-i', inPath,
			'-f', 'image2',
			'-vframes', count || 1,
			'-s', 'sqcif',
			'-aspect', '4:3',
			'-ss', '15',
			outPath
		], function (stdout) {
			parse(stdout, handler);
		});
	};
	
	return self;
}();

exports.ffmpeg = ffmpeg;

