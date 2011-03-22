////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.services = function ($) {
	var url = 'http://127.0.0.1:8124/';
		
	return {
		// adds a root path to library (w/ import)
		addroot: function (path, handler) {
			$.getJSON(url + 'addroot', {
				path: path
			}, handler);
		},
		
		// retrieves a list of available libraries
		getlibs: function (handler) {
			$.getJSON(url + 'getlibs', handler);
		},
		
		// retrieves a list of available libraries
		setlib: function (name, handler) {
			$.getJSON(url + 'setlib', {
				name: name
			}, handler);
		},
		
		// retrieves all media (matching the filter) from library
		getmedia: function (filter, handler) {
			$.getJSON(url + 'getmedia', {
				filter: filter
			}, handler);
		},
		
		// retrieves all tag kinds from library
		getkinds: function (handler) {
			$.getJSON(url + 'getkinds', handler);
		},
		
		// retrieves all tag kinds from library
		gettags: function (handler) {
			$.getJSON(url + 'gettags', handler);
		},
		
		// starts playback of a file
		play: function (path, handler) {
			$.getJSON(url + 'play', {
				path: path
			}, handler);
		},
		
		// rates a file
		rate: function (mediaid, rating, handler) {
			$.getJSON(url + 'rate', {
				mediaid: mediaid,
				at: rating
			}, handler);
		},
		
		// deletes tag on a file
		addtag: function (mediaid, tag, filter, handler) {
			var data = {
				mediaid: mediaid,
				tag: tag
			};
			if (filter) {
				data.filter = filter;
			}
			$.getJSON(url + 'addtag', data, handler);
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
			$.getJSON(url + 'changetag', data, handler);
		},
		
		// deletes tag on a file
		deltag: function (mediaid, tag, filter, handler) {
			var data = {
				tag: tag
			};
			if (filter) {
				data.filter = filter;
			}
			if (mediaid) {
				data.mediaid = mediaid;
			}
			$.getJSON(url + 'deltag', data, handler);
		}
	};
}(jQuery);
