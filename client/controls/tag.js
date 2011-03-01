////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var tag = function ($, services, editable) {
	// - data: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	return function (data, name) {
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
				services.deltag(null, name, refreshPage);
			} else {			
				services.deltag(data.mediaid, name, function () {
					delete lookup[name];
					data.tags = serialize();
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
			
			var newName = $(this).val();
			if (newName === name || !newName.length) {
				return;
			}
			if (event.ctrlKey && confirm("Are you sure you want to change all tags of this kind?")) {
				services.changetag(null, name, newName, refreshPage);
			} else {
				services.changetag(data.mediaid, name, newName, function () {
					delete lookup[name];
					name = newName;
					lookup[name] = true;
					data.tags = serialize();
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
					.text(name)));
		};

		self.edit = function () {
			return $('<input />', {'type': 'text', 'class': 'tag'})
				.val(name)
				.keyup(onChange);
		};
		
		return self;
	};
}(jQuery,
	services,
	editable);

