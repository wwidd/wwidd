////////////////////////////////////////////////////////////////////////////////
// Keywords Popup
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.preview = function () {
		var self = Object.create(controls.popup()),
				keywords = [],
				hash = '';
		
		//////////////////////////////
		// Setters
		
		self.keywords = function (value) {
			keywords = value;
			return self;
		};
		
		self.hash = function (value) {
			hash = value;
			return self;
		};
		
		//////////////////////////////
		// Overrides
		
		self.contents = function () {
			return [
				function () {
					if (hash.length) {
						return ['<img src="/cache/', hash, '.jpg">'].join('');
					}
				}(),
				'<table class="keywords">',
				function () {
					var result = [],
							i, keyword;
					for (i = 0; i < keywords.length; i++) {
						keyword = keywords[i].split(':');
						result.push([
							'<tr>',
							'<td class="key">', keyword[0], '</td>',
							'<td class="value">', keyword.slice(1).join(':'), '</td>',
							'</tr>'
						].join(''));
					}
					return result.join('');
				}(),
				'</table>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery);

