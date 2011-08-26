////////////////////////////////////////////////////////////////////////////////
// Background Processes
//
// Singleton that batches background processes such as metadata extraction,
// snapshot extraction, etc. together.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	thumb = require('../logic/thumb').thumb,
		media = require('../db/media').media,
		queue = require('../utils/queue').queue,
		ffmpeg = require('../tools/ffmpeg').ffmpeg,

processes,

// gets progress for one specific process
poll = function (name, handler) {
	processes[name].flush(function (data) {
		handler({
			progress: processes[name].progress(),
			load: data
		});
	});
};

processes = {
	// callback expects a path where the root part
	// and relative part are separated by colon
	// - path: e.g. '/media/HDD|/videos'
	// - finish: callback for each element in process queue 
	extractor: function () {
		var
		
		lookup = {
			'duration': 'Duration',
			'dimensions': 'dimensions',
			'distributor': 'WM/ContentDistributor',
			'copyright': 'copyright',
			'bitrate': 'bitrate',
			'video codec': 'video codec',
			'audio codec': 'audio codec',
			'genre': 'WM/Genre',
			'adult': 'WM/ParentalRating'
		},

		// handler run on each link in process queue
		process = queue(function (path, finish) {
			var tmp = path.split('|'),
					root = tmp[0],
					relative = tmp[1];
	
			// extracting metadata from file w/ ffmpeg
			ffmpeg.metadata(root + relative, function (data) {
				// filtering out useful metadata
				var keywords = {},
						key, value;

				for (key in lookup) {
					if (lookup.hasOwnProperty(key)) {
						value = data[lookup[key]];
						if (typeof value !== 'undefined' && value.length) {
							keywords[key] = data[lookup[key]];
						}
					}
				}
				
				finish({path: relative, keywords: keywords});
			});
		});
		
		return process;
	}(),
	
	thumbnails: function () {
		var entity = media(),
		
		process = queue(function (elem, finish) {
			var tmp = elem.split('|'),
					entry = {mediaid: tmp[0], root: tmp[1], path: tmp[2], hash: tmp[3]};
			console.log("THUMBS - generating thumbnail: " + entry.hash);
			thumb.generate(entry.root + entry.path, entry.hash, function (created) {
				finish(entry);
			});
		});
		
		process
			.onFlush(function (result, handler) {
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
				entity.multiSet(after, function () {
					// returning to caller process
					// (ending request when called from service)
					if (handler) {
						handler(after);
					}
				});
			});
			
		return process;
	}(),
	
	// polls process
	// - name: process name
	poll: function (name, handler) {
		var result,
				names, next;
		if (name) {
			// getting progress for one specific process			
			if (name === 'poll' || !processes.hasOwnProperty(name)) {
				throw "Invalid process name";
			} else {
				poll(name, handler);
			}
		} else {
			// getting progress for all processes
			result = {};
			names = ['extractor', 'thumbnails'];
			next = function (i) {
				if (i >= names.length) {
					if (handler) {
						handler(result);
					}
					return;
				}
				var name = names[i];
				poll(name, function (data) {
					result[name] = data;
					next(++i);
				});
			};
			next(0);
		}
	}
};

exports.processes = processes;

