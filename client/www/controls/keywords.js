////////////////////////////////////////////////////////////////////////////////
// Keywords Popup
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.keywords = function (data) {
		var self = Object.create(controls.popup());
		
		//////////////////////////////
		// Overrides

		self.contents = function (elem) {
			return [
				'<table class="keywords">',
				(function () {
					var result = [],
							i, keyword;
					for (i = 0; i < data.length; i++) {
						keyword = data[i].split(':');
						result.push([
							'<tr>',
							'<td class="key">', keyword[0], '</td>',
							'<td class="value">', keyword.slice(1).join(':'), '</td>',
							'</tr>'
						].join(''));
					}
					return result.join('');
				}()),
				'</table>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(yalp.controls || {},
	jQuery);

