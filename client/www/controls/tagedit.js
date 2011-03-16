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

		//////////////////////////////
		// Event handlers
		
		// tag remove event handler
		function onRemove(event) {
			var filter = controls.search.filter;
			
			if (event.shiftKey) {
				// deleting all tags like this one
				if (confirm("Delete ALL tags of this kind?")) {
					services.deltag(null, tag, null, controls.library.init);
				}
			} else if (event.ctrlKey) {
				// deleting tags from search results
				if (filter.length && confirm("Delete this tag from SEARCH results?")) {
					services.deltag(null, tag, controls.search.filter, controls.library.init);
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
					after = data.tag($(this).val()).sanitize();
			// discarding changes when there was no change or tag deleted
			if (after === before || !after.length) {
				return;
			}
			if (event.shiftKey) {
				// running batch tag change
				if (confirm("Change ALL tags of this kind?")) {
					services.changetag(null, before, after, controls.library.init);
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
		
		//////////////////////////////
		// Overrides
		
		self.init = function (elem) {
			if (self.mode === 'display') {
				elem.find('.remove').click(onRemove);
			} else {
				elem.find('input').keyup(onChange);
			}
			base.init(self, elem);
		};
		
		self.display = function () {
			var tmp = tag.split(':'),
					name = tmp[0] || '',
					kind = tmp[1] || '',
					hit = controls.search.filter.length && data.tag(controls.search.filter).match(name) ? 'hit' : null;
			
			return [
				'<span id="', self.id, '" class="', ['tag', 'display', data.kinds.getNumber(kind), hit].join(' '), '" title="', kind, '">',
				'<a href="#" class="remove"></a>',
				'<span>', name, '</span>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag edit">',
				'<input type="text" class="focus" value="', tag, '"/>',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

