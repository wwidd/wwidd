////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	// - row: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	controls.tagedit = function (row, name) {
		var	base = controls.tagbase(row),
				self = Object.create(base);

		// refreshes entire page (data & UI)
		function refreshPage() {
			self
				.parent	// tagger
				.parent	// media
				.parent	// page
				.load();
		}
				
		// tag remove event handler
		function onRemove(event) {
			if (event.ctrlKey && confirm("Are you sure you want to delete all tags of this kind?")) {
				// deleting all tags bearing this name
				services.deltag(null, name, refreshPage);
			} else {
				// deleting tag from one specific video
				services.deltag(row.mediaid, name, function () {
					self.changetag(name, null, row);
				});
			}
			return false;
		}
		
		// tag change event handler
		function onChange(event) {
			// react to Enter only
			if (event.which !== 13) {
				return;
			}
			// values before and after the change
			var before = name,
					after = controls.tags($(this).val()).sanitize();
			// discarding changes when there was no change or tag deleted
			if (after === before || !after.length) {
				return;
			}
			if (event.ctrlKey && confirm("Are you sure you want to change all tags of this kind?")) {
				// running batch tag change
				services.changetag(null, before, after, refreshPage);
			} else {
				// running single tag change
				services.changetag(row.mediaid, before, after, function () {
					self.changetag(before, after, row);
				});
			}
		}
		
		self.display = function () {
			var tag = name.split(':');
			return base.display(self, $('<span />', {'class': 'tag'})
				.addClass(data.kinds.getNumber(tag[1]))
				.attr('title', tag[1])
				// adding removal button
				.append($('<a />', {'href': '#'})
					.text('x')
					.click(onRemove))
				// adding tag text
				.append($('<span />')
					.text(tag[0])));
		};

		self.edit = function () {
			return $('<input />', {'type': 'text', 'class': 'tag'})
				.val(name)
				.keyup(onChange);
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

