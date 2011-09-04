////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, confirm */
var app = app || {};

app.controls = function (controls, $, jOrder, services, data) {
	// - row: media data record
	// - tag: tag string "name:kind"
	controls.tagedit = function (row, tag) {
		var	self = controls.control.create(controls.tag(row)),
				tmp = tag.split(':'),
				name = tmp[0] || '',
				kind = tmp[1] || '';

		self.data.row = row;
		self.data.tag = tag;
		self.hints = controls.tagedit.hints;
				
		//////////////////////////////
		// Overrides
		
		self.display = function () {
			var hit = controls.search.filter.length && data.tag(controls.search.filter).match(name) ? 'hit' : null;
			
			return [
				'<span id="', self.id, '" class="', ['tag background tagedit editable display', data.kinds.getNumber(kind), hit].join(' '), '" title="', kind, '">',
				'<span>', name.replace(' ', '&nbsp;'), '</span>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag tagedit edit ' + data.kinds.getNumber(kind) + '">',
				'<div class="background"></div>',
				'<input type="text" class="focus" value="', tag, '"/>',
				'<a href="#" class="button remove" title="Remove tag"></a>',
				tag.indexOf(' ') === -1 ? '' : '<a href="#" class="button explode" title="Explode tag"></a>',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static properties

	// hints associated with this control
	controls.tagedit.hints = [
		"SHIFT + ENTER to change tag on checked videos.",
		"SHIFT + CLICK on delete to remove all occurrences.",
		"CTRL + ENTER to change tag on search results.",
		"CTRL + CLICK on delete to remove from search results."	
	].concat(controls.tag.hints);
	
	//////////////////////////////
	// Static event handlers

	function getSelf(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')];
	}

	// general button handler
	function onButton(event, service, lang, handler) {
		var self = getSelf($(this)),
				row = self.data.row,
				tag = self.data.tag,
				filter = controls.search.filter;
		
		if (event.shiftKey) {
			// deleting all tags like this one
			if (self.parent.parent.selected()) {
				if (confirm(lang.sel)) {
					service(null, tag, null, jOrder.keys(controls.library.selected).join(','), controls.library.load);
				}
			} else if (confirm(lang.all)) {
				service(null, tag, null, null, controls.library.load);
			}
		} else if (event.ctrlKey) {
			// deleting tags from search results
			if (filter.length && confirm(lang.hits)) {
				service(null, tag, controls.search.filter, null, controls.library.load);
			}
		} else {
			// deleting tag from one specific video
			service(row.mediaid, tag, null, null, function () {
				if (handler) {
					handler.call(self, tag, row);
				}
			});
		}
	}
	
	// tag remove event handler
	function onRemove(event) {
		onButton.call(this, event, services.deltag, {
			sel: "Delete this tag from SELECTED videos?",
			all: "Delete ALL tags of this kind?",
			hits: "Delete this tag from SEARCH results?"
		}, function (tag, row) {
			this.changetag(tag, null, row);
		});
		return false;
	}

	// tag explode (split) event handler
	function onExplode(event) {
		onButton.call(this, event, services.explodetag, {
			sel: "Explode this tag in SELECTED videos?",
			all: "Explode ALL tags of this kind?",
			hits: "Explode this tag in SEARCH results?"
		}, function (tag, row) {
			this.explode(tag, row);
		});
		return false;
	}
	
	// tag change event handler
	function onChange(event) {
		var $this = $(this),
				self = getSelf($this),
				row = self.data.row,
				tag = self.data.tag,
				before = tag,
				after = data.tag($this.val()).sanitize();
		
		if (event.which === 13) {
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
		}
	}
	
	var context = $('.tagedit.edit');
	$('.remove', context).live('click', onRemove);
	$('.explode', context).live('click', onExplode);
	$('input', context).live('keyup', onChange);

	return controls;
}(app.controls || {},
	jQuery,
	jOrder,
	app.services,
	app.data);

