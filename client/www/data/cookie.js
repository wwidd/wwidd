////////////////////////////////////////////////////////////////////////////////
// Browser Cookie
////////////////////////////////////////////////////////////////////////////////
/*global document */
var app = app || {};

app.data = function (data, services) {
	// parses the entire cookie string
	function parse() {
		var cookies = document.cookie.split('; '),
				result = {},
				kvp, i;
		for (i = 0; i < cookies.length; i++) {
			kvp = cookies[i].split('=');
			result[kvp[0]] = kvp[1];
		}
		return result;
	}
	
	data.cookie = function () {
		var self = {
			// sets a cookie
			// optionally w/ expiration (days) and path
			set: function (key, value, days, path) {
				var date = new Date();
				date.setTime(date.getTime() + ((days || 365) * 24 * 3600 * 1000));
				
				document.cookie = [
					key, '=', value, '; ',
					'expires=', date.toGMTString(), '; ',
					'path=', path || '/'
				].join('');
				
				return self;
			},
			
			// gets a cookie
			get: function (key) {
				return parse()[key];
			},
			
			// erases a cookie
			unset: function (key) {
				self.set(key, '', -1);
				return self;
			}
		};

		return self;
	}();
	
	return data;
}(app.data || {},
	app.services);

