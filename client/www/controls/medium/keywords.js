////////////////////////////////////////////////////////////////////////////////
// Keywords Control
//
// Displays video metadata such as duration, dimensions, codecs, etc.
// Read only.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, data) {
	controls.keywords = function (mediaid) {
		var self = controls.control.create(),
				keywords = [],
				special = {},
				rest = {},
				compact = true;

		//////////////////////////////
		// Setters / getters
		
		self.compact = function (value) {
			compact = value;
			return self;
		};

		//////////////////////////////
		// Overrides

		// initializes lookup buffers
		function prepare() {
			keywords = (data.media.getRow(mediaid) || {keywords: []}).keywords;
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
			return self;
		}
		
		self.html = function () {
			var result = ['<div id="' + self.id + '" class="keywords">'],
					key;

			// initializing buffers
			prepare();
					
			// adding duration and dimensions
			result.push([
				'<span class="duration" title="', "duration", '">', special.duration || "N/A", '</span>'
			].join(''));
			result.push([
				'<span class="dimensions" title="', "dimensions", '">', (/\d+[x:]\d+/).exec(special.dimensions) || "N/A", '</span>'
			].join(''));

			// adding all else
			if (compact) {
				result.push('<ul class="details">');
				for (key in rest) {
					if (rest.hasOwnProperty(key)) {
						result.push('<li><span title="' + key + '">' + rest[key] + '</span></li>');
					}
				}
				result.push('</ul>');
			} else {
				result.push('<div class="details">');
				result.push('<table>');
				for (key in rest) {
					if (rest.hasOwnProperty(key)) {
						result.push('<tr><td><span>' + key + '</span></td><td><span title="' + rest[key] + '">' + rest[key] + '</span></td></tr>');
					}
				}
				result.push('</table>');
				result.push('</div>');
			}
			result.push('</div>');
			return result.join('');
		};

		return self;
	};
	
	return controls;
}(app.controls || {},
	jQuery,
	app.data);

