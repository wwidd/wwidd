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
				lookup = {}, i;

		// initializing tag lookup
		(function (siblings) {
			for (i = 0; i < siblings.length; i++) {
				lookup[siblings[i]] = true;
			}
		}(data.tags.split(',')));
		
		// re-builds siblings array from lookup
		function serialize() {
			var siblings = [],
					name;
			for (name in lookup) {
				siblings.push(name);
			}
			return siblings.join(',');
		}
				
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
				lookup[name] = true;
				data.tags = serialize();
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
	editable);

