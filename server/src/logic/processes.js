////////////////////////////////////////////////////////////////////////////////
// Background Processes
//
// Singleton that batches background processes such as metadata extraction,
// snapshot extraction, etc. together.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	thumb = require('../logic/thumb').thumb,
		library = require('../db/library').library,
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
	thumbnails: function () {
		var entity = media(),
		
		// keyword / metadata lookup 
		lookup = {
			'title': 'title',
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

		// filters out useful metadata
		// returns uniform keywords
		// format: {key: value}
		// - data: metadata returned by thumbnail generator
		//	 format: {key: value}
		filter = function (data) {
			var result = {},
					key, value;
			for (key in lookup) {
				if (lookup.hasOwnProperty(key)) {
					value = data[lookup[key]];
					if (typeof value !== 'undefined' && value.length) {
						result[key] = data[lookup[key]];
					}
				}
			}
			return result;
		},
		
		toArray = function (obj) {
			var result = [],
					key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					result.push(key + ':' + obj[key]);
				}
			}
			return result;
		},
		
		// thumbnail process
		process = queue(function (elem, finish) {
			var tmp = elem.split('|'),
					entry = {rootid: tmp[0], mediaid: tmp[1], root: tmp[2], path: tmp[3], hash: tmp[4], keywords: {}};
			thumb.generate(entry.root + entry.path, entry.hash, function (data) {
				if (typeof data !== 'undefined') {
					console.log("PROCESSES - generated thumbnail: " + entry.hash);
					entry.keywords = filter(data);
				}
				finish(entry);
			});
		});
		
		// adding process events
		process
			.onFlush(function (result, handler) {
				// assembling hash update
				var hashes = {},			// format: {mediaid: {hash: hash}}
						keywords = {},		// format: {rootid: {path: keywords}}
						response = {},		// format: {mediaid: {hash: hash, keywords: keywords}}
						i, entry;
				for (i = 0; i < result.length; i++) {
					entry = result[i];
					
					// adding hash
					hashes[entry.mediaid] = {
						hash: entry.hash
					};
					
					// adding keywords to library ingest
					if (!keywords.hasOwnProperty(entry.rootid)) {
						keywords[entry.rootid] = {};
					}
					keywords[entry.rootid][entry.path] = entry.keywords;
					
					// adding hash and keyword to response
					response[entry.mediaid] = {
						hash: entry.hash,
						keywords: toArray(entry.keywords)
					};
				}
				
				// updating hashes
				entity.multiSet(hashes, function () {
					// updating metadata
					library.fill(keywords, {tags: false}, function () {
						// returning to caller process
						// (ending request when called from service)
						if (handler) {
							handler(response);
						}
					});
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
			names = ['thumbnails'];
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

