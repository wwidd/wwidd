////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, confirm */
var app = app || {};

app.controls = function (controls, $, jOrder, services, data) {
	// - mediaid: media identifier
	// - tag: tag string "name:kind"
	controls.tagedit = function (mediaid, tag) {
		var	self = controls.control.create(controls.tag(mediaid)),
				tmp = tag.split(':'),
				name = tmp[0] || '',
				kind = tmp[1] || '';

		self.data.mediaid = mediaid;
		self.data.tag = tag;
		self.hints = controls.tagedit.hints;

		//////////////////////////////
		// Getters / setters
		
		self.kind = function () {
			return kind;
		};
		
		self.name = function () {
			return name;
		};

		//////////////////////////////
		// Overrides
		
		self.display = function () {
			var hit = controls.search.filter().length && data.tag(controls.search.filter()).match(name) ? 'hit' : null;
			
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
				mediaid = self.data.mediaid,
				tag = self.data.tag,
				filter = controls.search.filter();
		
		if (event.shiftKey) {
			// deleting all tags like this one
			if (self.parent.parent.selected()) {
				if (confirm(lang.sel)) {
					service(null, tag, null, jOrder.keys(controls.media.selected).join(','), controls.media.load);
				}
			} else if (confirm(lang.all)) {
				service(null, tag, null, null, controls.media.load);
			}
		} else if (event.ctrlKey) {
			// deleting tags from search results
			if (filter.length && confirm(lang.hits)) {
				service(null, tag, controls.search.filter(), null, controls.media.load);
			}
		} else {
			// deleting tag from one specific video
			service(mediaid, tag, null, null, function () {
				if (handler) {
					handler.call(self, tag);
				}
			});
		}
	}
	
	// tag remove event handler
	function onRemove(event) {
		onButton.call(this, event, services.tag.del, {
			sel: "Delete this tag from SELECTED videos?",
			all: "Delete ALL tags of this kind?",
			hits: "Delete this tag from SEARCH results?"
		}, function (tag) {
			this.changetag(tag, null);
		});
		return false;
	}

	// tag explode (split) event handler
	function onExplode(event) {
		onButton.call(this, event, services.tag.explode, {
			sel: "Explode this tag in SELECTED videos?",
			all: "Explode ALL tags of this kind?",
			hits: "Explode this tag in SEARCH results?"
		}, function (tag) {
			this.explode(tag);
		});
		return false;
	}
	
	// tag change event handler
	function onChange(event) {
		var $this = $(this),
				self = getSelf($this),
				mediaid = self.data.mediaid,
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
					services.tag.set(null, before, after, function () {
						// applying changes locally
						data.media.changeAllTags(before, after);
						// refreshing current page
						controls.media.refresh();
					});
				}
			} else if (event.ctrlKey) {
				// ctrl + enter is not defined for editing
			} else {
				// running single tag change
				services.tag.set(mediaid, before, after, function () {
					self.changetag(before, after);
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

