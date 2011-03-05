////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	// - row: media data record
	// - tag: tag string "name:kind"
	controls.tagedit = function (row, tag) {
		var	base = controls.tagbase(row),
				self = Object.create(base);

		// refreshes entire page (data & UI)
		function refreshPage() {
			controls.page.load();
		}
				
		// tag remove event handler
		function onRemove(event) {
			if (event.ctrlKey && confirm("Are you sure you want to delete all tags of this kind?")) {
				// deleting all tags like this one
				services.deltag(null, tag, refreshPage);
			} else {
				// deleting tag from one specific video
				services.deltag(row.mediaid, tag, function () {
					self.changetag(tag, null, row);
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
			var before = tag,
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
		
		// constructs display state of the control
		self.display = function () {
			var tmp = tag.split(':'),
					name = tmp[0] || '',
					kind = tmp[1] || '';
			return base.display(self, $('<span />', {'class': 'tag'})
				.addClass(data.kinds.getNumber(kind))
				.attr('title', kind)
				// adding removal button
				.append($('<a />', {'href': '#'})
					.text('x')
					.click(onRemove))
				// adding tag text
				.append($('<span />')
					.text(name)));
		};

		// constructs edit state of the control
		self.edit = function () {
			return $('<input />', {'type': 'text', 'class': 'tag'})
				.val(tag)
				.keyup(onChange);
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

