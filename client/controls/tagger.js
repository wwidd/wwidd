////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var tagger = function ($, services, control, tag, addtag) {
	return function (data) {
		var	base = control(),
				self = Object.create(base);

		self.getUI = function () {
			var tags = data.tags.split(','),
					result = $('<div />'),
					i;
			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				tag(data, i).appendTo(result, self);
			}
			addtag(data).appendTo(result, self);
			return result;
		};

		return self;
	};
}(jQuery,
	services,
	editable,
	tag,
	addtag);

