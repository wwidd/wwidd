////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert, window */
var app = app || {};

app.services = function ($, window, service, poll) {
	return {
		// adds a root path to library (w/ import)
		addroot: function (path, handler) {
			service('root/add').call({
				path: path
			}, handler);
		},
		
		// retrieves a list of available libraries
		getlibs: function (handler) {
			service('lib/getall').call(null, handler);
		},
		
		// retrieves a list of available libraries
		setlib: function (name, handler) {
			service('lib/select').call({
				name: name
			}, handler);
		},
		
		// retrieves all media (matching the filter) from library
		getmedia: function (filter, handler) {
			service('media/get').call({
				filter: filter
			}, handler);
		},
		
		// retrieves all tags from library
		gettags: function (handler) {
			service('tag/getall').call(null, handler);
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
		
		// adds tag to a file
		addtag: function (mediaid, tag, filter, mediaids, handler) {
			service('tag/add').unary(mediaid, tag, filter, mediaids, handler);			
		},

		// changes tag on a file
		changetag: function (mediaid, before, after, handler) {
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
		explodetag: function (mediaid, tag, filter, mediaids, handler) {
			service('tag/explode').unary(mediaid, tag, filter, mediaids, handler);			
		},
		
		// deletes tag(s)
		deltag: function (mediaid, tag, filter, mediaids, handler) {
			service('tag/del').unary(mediaid, tag, filter, mediaids, handler);
		},
		
		// gets directory tree for given root path(s)
		// - root: unix absolute path(s separadted by commas) without leading slash
		getdirs: function (root, handler) {
			var data = {};
			if (root) {
				data.root = root;
			}
			service('sys/dirlist').call(data, handler);
		},
		
		// generates thumbs for a set of video files
		// - mediaids: comma separated list of media ids
		genthumbs: function (mediaids, handler) {
			var data = {
				mediaids: mediaids
			};
			service('media/extract').call(data, handler);			
		},
		
		poll: function (process, handler) {
			poll(process, handler);
		}
	};
}(jQuery,
	window,
	app.service,
	app.poll);
