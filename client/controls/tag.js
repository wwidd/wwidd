////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var tag = function ($, services, editable) {
	// - data: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	return function (data, idx, handler) {
		var	base = editable(),
				self = Object.create(base),
				siblings = data.tags.split(','),
				text = siblings[idx];

		// tag remove event handler
		function onRemove() {
			services.deltag(data.mediaid, text, function () {
				siblings.splice(idx, 1);
				data.tags = siblings.join(',');
				if (handler) {
					handler();
				}
			});
			return false;
		}
		
		// tag change event handler
		function onChange() {
			var newTag = $(this).val();
			if (newTag === text || !newTag.length) {
				return;
			}
			services.changetag(data.mediaid, text, newTag, function () {
				siblings[idx] = newTag;
				data.tags = siblings.join(',');
				if (handler) {
					handler();
				}
			});
		}
		
		self.display = function () {
			return base.display(self, $('<span />', {'class': 'tag'})
				// adding removal button
				.append($('<a />', {'href': '#'})
					.text('x')
					.click(onRemove))
				// adding tag text
				.append($('<span />')
					.text(text)));
		};

		self.edit = function () {
			return $('<input />', {'type': 'text', 'class': 'tag'})
				.val(text)
				.blur(onChange);
		};
		
		return self;
	};
}(jQuery,
	services,
	editable);

