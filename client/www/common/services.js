////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert */
var yalp = yalp || {};

yalp.services = function ($) {
	var url = 'http://127.0.0.1:8124/';
	
	// calls the service
	function callService(endpoint, data, handler) {
		$.ajax(url + endpoint, {
			data: data,
			dataType: 'json',
			success: handler,
			error: function (xhr) {
				var data = $.parseJSON(xhr.responseText);
				alert([
					"Service call failed. Details:",
					"endpoint: \"" + endpoint + "\"",
					"message: \"" + data.message + "\""
				].join('\n'));
			}
		});
	}
	
	return {
		// adds a root path to library (w/ import)
		addroot: function (path, handler) {
			callService('addroot', {
				path: path
			}, handler);
		},
		
		// retrieves a list of available libraries
		getlibs: function (handler) {
			callService('getlibs', null, handler);
		},
		
		// retrieves a list of available libraries
		setlib: function (name, handler) {
			callService('setlib', {
				name: name
			}, handler);
		},
		
		// retrieves all media (matching the filter) from library
		getmedia: function (filter, handler) {
			callService('getmedia', {
				filter: filter
			}, handler);
		},
		
		// retrieves all tag kinds from library
		getkinds: function (handler) {
			callService('getkinds', null, handler);
		},
		
		// retrieves all tag kinds from library
		gettags: function (handler) {
			callService('gettags', null, handler);
		},
		
		// starts playback of a file
		play: function (path, handler) {
			callService('play', {
				path: path
			}, handler);
		},
		
		// rates a file
		rate: function (mediaid, rating, handler) {
			callService('rate', {
				mediaid: mediaid,
				at: rating
			}, handler);
		},
		
		// deletes tag on a file
		addtag: function (mediaid, tag, filter, mediaids, handler) {
			var data = {
				mediaid: mediaid,
				tag: tag
			};
			if (filter) {
				data.filter = filter;
			}
			if (mediaids) {
				data.mediaids = mediaids;
			}
			callService('addtag', data, handler);
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
			callService('changetag', data, handler);
		},
		
		// deletes tag on a file
		deltag: function (mediaid, tag, filter, mediaids, handler) {
			var data = {
				tag: tag
			};
			if (filter) {
				data.filter = filter;
			}
			if (mediaid) {
				data.mediaid = mediaid;
			}
			if (mediaids) {
				data.mediaids = mediaids;
			}
			callService('deltag', data, handler);
		}
	};
}(jQuery);
