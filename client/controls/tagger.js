////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.tagger = function (row) {
		var	self = Object.create(controls.control);

		self.getUI = function () {
			var tags = row.tags,
					result = $('<div />'),
					i;
			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				controls.tagedit(row, tags[i]).appendTo(result, self);
			}
			controls.tagadd(row).appendTo(result, self);
			return result;
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

