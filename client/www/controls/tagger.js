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
			$('#' + adder.id).click();
		};
				
		self.getUI = function () {
			var tags = row.tags,
					result = $('<div />'),
					i, kind, control;

			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				kind = tags[i].split(':')[1];
				if (!controls.kinds.hidden(kind)) {
					control = controls.tagedit(row, tags[i]);
					control.parent = self;
					control.render(result);
				}
			}
			adder = controls.tagadd(row);
			adder.parent = self;
			adder.render(result);
			return result;
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

