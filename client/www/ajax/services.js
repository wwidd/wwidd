////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert, window */
var app = app || {};

app.services = function ($, window, service, poll) {
	return {
		lib: {
			// retrieves a list of available libraries
			getall: function (handler) {
				service('lib/getall').call(null, handler);
			},
			
			// retrieves a list of available libraries
			select: function (name, handler) {
				service('lib/select').call({
					name: name
				}, handler);
			}		
		},
		
		media: {
			// retrieves all media (matching the filter) from library
			get: function (filter, handler) {
				service('media/get').call({
					filter: filter
				}, handler);
			},
			
			// starts playback of a file
			play: function (mediaid, handler) {
				service('media/play').call({
					mediaid: mediaid
				}, handler);
			},
			
			// rates a file
			rate: function (mediaid, rating, handler) {
				service('media/rate').call({
					mediaid: mediaid,
					at: rating
				}, handler);
			},
		
			// generates thumbs for a set of video files
			// - mediaids: comma separated list of media ids
			extract: function (mediaids, handler) {
				var data = {
					mediaids: mediaids
				};
				service('media/extract').call(data, handler);			
			}		
		},
		
		tag: {
			// retrieves all tags from library
			getall: function (handler) {
				service('tag/getall').call(null, handler);
			},
			
			// adds tag to a file
			add: function (mediaid, tag, filter, mediaids, handler) {
				service('tag/add').unary(mediaid, tag, filter, mediaids, handler);			
			},
	
			// changes tag on a file
			set: function (mediaid, before, after, handler) {
				var data = {
					before: before,
					after: after
				};
				if (mediaid) {
					data.mediaid = mediaid;
				}
				service('tag/set').call(data, handler);
			},
			
			// explodes tag(s)
			explode: function (mediaid, tag, filter, mediaids, handler) {
				service('tag/explode').unary(mediaid, tag, filter, mediaids, handler);			
			},
			
			// deletes tag(s)
			del: function (mediaid, tag, filter, mediaids, handler) {
				service('tag/del').unary(mediaid, tag, filter, mediaids, handler);
			}
		},
		
		root: {
			// adds a root path to library (w/ import)
			add: function (path, handler) {
				service('root/add').call({
					path: path
				}, handler);
			}
		},
		
		sys: {
			// gets directory tree for given root path(s)
			// - root: unix absolute path(s separadted by commas) without leading slash
			dirlist: function (root, handler) {
				var data = {};
				if (root) {
					data.root = root;
				}
				service('sys/dirlist').call(data, handler);
			},
			
			poll: function (process, handler) {
				poll(process, handler);
			}
		}
	};
}(jQuery,
	window,
	app.service,
	app.poll);
