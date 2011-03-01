////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var tagadd = function ($, services, tagbase) {
	// - data: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	return function (data) {
		var	base = tagbase(data),
				self = Object.create(base);

		self.init();
				
		// tag addition handler: do nothing
		function onAdd(event) {
			event.preventDefault();
		}

		// tag change event handler
		function onChange(event) {
			if (event.which !== 13) {
				return;
			}
			var name = $(this).val();
			if (!name.length) {
				return;
			}
			services.addtag(data.mediaid, name, function () {
				self.lookup[name] = true;
				data.tags = self.serialize();
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
				.keyup(onChange);
		};
		
		return self;
	};
}(jQuery,
	services,
	tagbase);

