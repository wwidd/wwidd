////////////////////////////////////////////////////////////////////////////////
// ffmpeg tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	$path = require('path'),
		tool = require('../tools/tool').tool,
		parser = require('../utils/parser').parser,

ffmpeg = function () {
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
										'audio codec': row[0],
										'sampling freq': row[1],
										'audio channels': row[2],
										'audio bps': row[3],
										'audio bitrate': row[4]
									});
								} else if (row.match(/^Video:/)) {
									// video channel
									row = row.substr('Video: '.length).split(/,\s*/);
									properties = {
										'video codec': row[0],
										'color space': row[1],
										'dimensions': row[2]
									};
									for (l = 3; l < row.length; l++) {
										tmp = row[l].split(' ');
										properties['video ' + tmp[1]] = tmp[0];
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
	
	// unites metadata chapters
	// - metadata: multi-chapter metadatata
	function unite(metadata) {
		// uniting metadata chapters
		var i, key,
				chapter,
				result = {};
		for (i = 0; i < metadata.length; i++) {
			chapter = metadata[i];
			for (key in chapter) {
				if (chapter.hasOwnProperty(key)) {
					result[key] = chapter[key];
				}
			}
		}
		return result;
	}
	
	// processes metadata
	function process(stdout, handler) {
		parse(stdout, function (metadata) {
			if (handler) {
				handler(unite(metadata));
			}
		});
	}
	
	// extracts metadata from video file
	// - inPath: path to video file
	// - outPath: path to thumbnail, no thumbnail will be generated when absent
	// - count: number of thumbs to generate
	self.exec = function (inPath, outPath, count, handler) {
		var args = outPath ? [
			'-i', inPath,
			'-f', 'image2',
			'-vframes', count || 1,
			'-s', 'sqcif',
			'-aspect', '4:3',
			'-ss', '15',
			outPath
		] : [
			'-i', inPath
		];
		
		// check if thumbnail exists
		tool.exec.call(self, args, function (code, stdout) {
			if (code === 0) {
				process(stdout, handler);
			} else if (handler) {
				handler();
			}
		}, true);
	};
	
	return self;
}();

exports.ffmpeg = ffmpeg;

