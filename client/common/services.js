////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
var services = function ($) {
	var url = 'http://127.0.0.1:8124/';
		
	return {
		// retrieves the entire library
		get: function (handler) {
			$.getJSON(url + 'get', handler);
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
		addtag: function (mediaid, tag, handler) {
			$.getJSON(url + 'addtag', {
				mediaid: mediaid,
				tag: tag
			}, handler);
		},

		// changes tag on a file
		changetag: function (mediaid, before, after, handler) {
			$.getJSON(url + 'changetag', {
				mediaid: mediaid,
				before: before,
				after: after
			}, handler);
		},
		
		// deletes tag on a file
		deltag: function (mediaid, tag, handler) {
			$.getJSON(url + 'deltag', {
				mediaid: mediaid,
				tag: tag
			}, handler);
		}
	};
}(jQuery);
