////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var tag = function ($, services, editable) {
	// - data: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	return function (data, idx) {
		var	base = editable(),
				self = Object.create(base),
				siblings = data.tags.split(','),
				text = siblings[idx];

		// refreshes entire page (data & UI)
		function refreshPage() {
			self
				.parent	// tagger
				.parent	// media
				.parent	// page
				.init();
		}
				
		// tag remove event handler
		function onRemove(event) {
			if (event.ctrlKey && confirm("Are you sure you want to delete all tags of this kind?")) {
				services.deltag(null, text, refreshPage);
			} else {			
				services.deltag(data.mediaid, text, function () {
					siblings.splice(idx, 1);
					data.tags = siblings.join(',');
					self.parent.redraw();
				});
			}
			return false;
		}
		
		// tag change event handler
		function onChange(event) {
			if (event.which !== 13) {
				return;
			}
			
			var newTag = $(this).val();
			if (newTag === text || !newTag.length) {
				return;
			}
			if (event.ctrlKey && confirm("Are you sure you want to change all tags of this kind?")) {
				services.changetag(null, text, newTag, refreshPage);
			} else {
				services.changetag(data.mediaid, text, newTag, function () {
					siblings[idx] = newTag;
					data.tags = siblings.join(',');
					self.parent.redraw();
				});
			}
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
				.keyup(onChange);
		};
		
		return self;
	};
}(jQuery,
	services,
	editable);

