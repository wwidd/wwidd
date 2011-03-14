////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.tagger = function (row) {
		var	self = Object.create(controls.control),
				adder;

		self.add = function () {
			adder.UI.click();
		};
		
		self.getUI = function () {
			var tags = row.tags,
					result = $('<div />'),
					i, kind;

			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				kind = tags[i].split(':')[1];
				if (!controls.kinds.hidden(kind)) {
					controls.tagedit(row, tags[i]).appendTo(result, self);
				}
			}
			(adder = controls.tagadd(row)).appendTo(result, self);
			return result;
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

