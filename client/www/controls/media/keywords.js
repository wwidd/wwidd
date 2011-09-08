////////////////////////////////////////////////////////////////////////////////
// Keywords Control
//
// Displays video metadata such as duration, dimensions, codecs, etc.
// Read only.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.keywords = function (keywords) {
		var self = controls.control.create(),
				special = {},
				rest = {};

		// initializing lookup
		(function () {
			var i, keyword, key;
			for (i = 0; i < keywords.length; i++) {
				keyword = keywords[i].split(':');
				key = keyword.shift();
				rest[key] = keyword.join(':');
			}
			special = {
				duration: rest.duration,
				dimensions: rest.dimensions
			};
			delete rest.duration;
			delete rest.dimensions;
		}());
				
		//////////////////////////////
		// Overrides

		self.html = function () {
			var result = ['<div id="' + self.id + '" class="keywords">'],
					key;
			for (key in special) {
				if (special.hasOwnProperty(key)) {
					result.push('<span class="' + key + '" title="' + key + '">' + special[key] + '</span>');
				}
			}	
			result.push('<ul>');
			for (key in rest) {
				if (rest.hasOwnProperty(key)) {
					result.push('<li><span title="' + key + '">' + rest[key] + '</span></li>');
				}
			}
			result.push('</ul>');
			result.push('</div>');
			return result.join('');
		};

		return self;
	};
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

