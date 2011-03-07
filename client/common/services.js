////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
var services = function ($) {
	var url = 'http://127.0.0.1:8124/';
		
	return {
		// adds a root path to library (w/ import)
		addroot: function (path, handler) {
			$.getJSON(url + 'addroot', {
				path: path
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
			$.getJSON(url + 'addtag', {
				mediaid: mediaid,
				tag: tag,
				filter: filter || ""
			}, handler);
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
		deltag: function (mediaid, tag, handler) {
			var data = {
				tag: tag
			};
			if (mediaid) {
				data.mediaid = mediaid;
			}
			$.getJSON(url + 'deltag', data, handler);
		}
	};
}(jQuery);
