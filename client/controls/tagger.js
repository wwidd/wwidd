////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, control, tagedit, tagadd) {
	controls.tagger = function (data) {
		var	base = control(),
				self = Object.create(base);

		self.getUI = function () {
			var tags = data.tags.split(','),
					result = $('<div />'),
					i;
			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				tagedit(data, tags[i]).appendTo(result, self);
			}
			tagadd(data).appendTo(result, self);
			return result;
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	controls.editable,
	controls.tagedit,
	controls.tagadd);

