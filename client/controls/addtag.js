////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var addtag = function ($, services, editable) {
	// - data: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	return function (data) {
		var	base = editable(),
				self = Object.create(base),
				siblings = data.tags.split(',');

		// tag addition handler: do nothing
		function onAdd(event) {
			event.preventDefault();
		}
				
		// tag change event handler
		function onChange() {
			var newTag = $(this).val();
			if (!newTag.length) {
				return;
			}
			services.addtag(data.mediaid, newTag, function () {
				siblings.push(newTag);
				data.tags = siblings.join(',');
				self.parent.redraw();
			});
		}

		self.display = function () {
			return base.display(self, $('<span />', {'class': 'add tag'})
				// adding removal button
				.append($('<a />', {'href': '#'})
					.text('+')
					.click(onAdd)));
		};

		self.edit = function () {
			return $('<input />', {'type': 'text', 'class': 'add tag'})
				.blur(onChange);
		};
		
		return self;
	};
}(jQuery,
	services,
	editable);

