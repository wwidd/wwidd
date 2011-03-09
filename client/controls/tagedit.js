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

		// tag remove event handler
		function onRemove(event) {
			var filter = controls.search.filter;
			
			if (event.shiftKey) {
				// deleting all tags like this one
				if (confirm("Delete ALL tags of this kind?")) {
					services.deltag(null, tag, null, controls.page.load);
				}
			} else if (event.ctrlKey) {
				// deleting tags from search results
				if (filter.length && confirm("Delete this tag from SEARCH results?")) {
					services.deltag(null, tag, controls.search.filter, controls.page.load);
				}
			} else {
				// deleting tag from one specific video
				services.deltag(row.mediaid, tag, null, function () {
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
					after = data.taglist($(this).val()).sanitize();
			// discarding changes when there was no change or tag deleted
			if (after === before || !after.length) {
				return;
			}
			if (event.shiftKey) {
				// running batch tag change
				if (confirm("Change ALL tags of this kind?")) {
					services.changetag(null, before, after, controls.page.load);
				}
			} else if (event.ctrlKey) {
				// ctrl + enter is not defined for editing
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
			return base.display(self, $('<span />', {'class': 'tag display'})
				.addClass(data.kinds.getNumber(kind))
				.addClass(controls.search.filter.length && data.taglist(controls.search.filter).match(name) ? 'hit' : null)
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
			return $('<span />', {'class': 'tag edit'})
				.append($('<input />', {'type': 'text', 'class': 'focus'})
					.val(tag)
					.keyup(onChange));
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

