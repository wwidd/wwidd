////////////////////////////////////////////////////////////////////////////////
// Service
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window, alert */
var app = app || {};

app.service = function ($) {
	var url = window.location.protocol + '//' + window.location.host;
	
	return function (endpoint) {
		var self = {
			// calls a service
			call: function (data, handler) {
				$.ajax(url + '/' + endpoint, {
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
			},
			
			// calls a unary tag transformation service
			unary: function (mediaid, tag, filter, mediaids, handler) {
				var data = {
					tag: tag
				};
				if (filter) {
					data.filter = filter;
				}
				if (typeof mediaid !== 'undefined' && mediaid !== null) {
					data.mediaid = mediaid;
				}
				if (mediaids) {
					data.mediaids = mediaids;
				}
				self.call(data, handler);
			}
		};
		
		return self;
	};
}(jQuery);
