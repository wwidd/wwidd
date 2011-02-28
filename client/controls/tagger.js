////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var tagger = function ($, services, control, tag, addtag) {
	return function (data) {
		var	base = control(),
				self = Object.create(base);

		// event hadler for 
		function onRemove() {
			self.redraw();
		}

		self.getUI = function () {
			var tags = data.tags.split(','),
					result = $('<div />'),
					i;
			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				tag(data, i, onRemove).appendTo(result);
			}
			addtag(data, onRemove).appendTo(result);
			return $(result);
		};

		return self;
	};
}(jQuery,
	services,
	editable,
	tag,
	addtag);

