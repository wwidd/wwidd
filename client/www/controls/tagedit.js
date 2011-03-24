////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.controls = function (controls, $, services, data) {
	// - row: media data record
	// - tag: tag string "name:kind"
	controls.tagedit = function (row, tag) {
		var	base = controls.tag(row),
				self = Object.create(base);

		self.data.row = row;
		self.data.tag = tag;
				
		//////////////////////////////
		// Overrides
		
		self.display = function () {
			var tmp = tag.split(':'),
					name = tmp[0] || '',
					kind = tmp[1] || '',
					hit = controls.search.filter.length && data.tag(controls.search.filter).match(name) ? 'hit' : null;
			
			return [
				'<span id="', self.id, '" class="', ['tag', 'tagedit', 'editable', 'display', data.kinds.getNumber(kind), hit].join(' '), '" title="', kind, '">',
				'<a href="#" class="remove"></a>',
				'<span>', name, '</span>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag tagedit edit">',
				'<input type="text" class="focus" value="', tag, '"/>',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers

	function getData(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')].data;
	}

	// tag remove event handler
	function onRemove(event) {
		var tmp = getData($(this)),
				self = tmp.that,
				row = tmp.row,
				tag = tmp.tag,
				filter = controls.search.filter;
		
		if (event.shiftKey) {
			// deleting all tags like this one
			if (self.parent.parent.selected()) {
				if (confirm("Delete this tag from SELECTED videos?")) {
					services.deltag(null, tag, null, controls.library.selection().join(','), controls.library.load);
				}
			} else if (confirm("Delete ALL tags of this kind?")) {
				services.deltag(null, tag, null, null, controls.library.load);
			}
		} else if (event.ctrlKey) {
			// deleting tags from search results
			if (filter.length && confirm("Delete this tag from SEARCH results?")) {
				services.deltag(null, tag, controls.search.filter, null, controls.library.load);
			}
		} else {
			// deleting tag from one specific video
			services.deltag(row.mediaid, tag, null, null, function () {
				self.changetag(tag, null, row);
			});
		}
		return false;
	}

	// tag change event handler
	function onChange(event) {
		var $this = $(this),
				tmp = getData($this),
				self = tmp.that,
				row = tmp.row,
				tag = tmp.tag,
				before = tag,
				after = data.tag($this.val()).sanitize();
		
		switch (event.which) {
		case 13:
			// enter - saving values
			// discarding changes when there was no change or tag deleted
			if (after === before || !after.length) {
				return;
			}
			if (event.shiftKey) {
				// running batch tag change
				if (confirm("Apply change to ALL tags of this kind?")) {
					services.changetag(null, before, after, controls.library.load);
				}
			} else if (event.ctrlKey) {
				// ctrl + enter is not defined for editing
			} else {
				// running single tag change
				services.changetag(row.mediaid, before, after, function () {
					self.changetag(before, after, row);
				});
			}
			break;
		case 27:
			// escape - cancel
			self.toggle('display');
			break;
		default:
			return;
		}
	}
		
	$('.tagedit.display .remove').live('click', onRemove);
	$('.tagedit.edit input').live('keyup', onChange);

	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services,
	yalp.data);

