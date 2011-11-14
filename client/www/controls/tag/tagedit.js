////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, flock, window */
var app = app || {};

app.controls = function (controls, $, jOrder, flock, cache, services, data) {
	// - mediaid: media identifier
	// - tag: tag string "name:kind"
	controls.tagedit = function (mediaid, tag) {
		var	self = controls.control.create(controls.tag(mediaid)),
				tmp = tag.split(':'),
				name = tmp[0] || '',
				kind = tmp[1] || '';

		self.hints = controls.tagedit.hints;

		//////////////////////////////
		// Getters / setters
		
		self.kind = function () {
			return kind;
		};
		
		self.name = function () {
			return name;
		};

		self.tag = function () {
			return tag;
		};
		
		self.mediaid = function () {
			return mediaid;
		};

		//////////////////////////////
		// Overrides
		
		self.display = function () {
			var hit = controls.search.filter().length && data.tag.match(controls.search.filter(), name) ? 'hit' : null;
			
			return [
				'<span id="', self.id, '" class="', ['tag background tagedit editable display', data.kind.getNumber(kind), hit].join(' '), '" title="', kind, '">',
				'<span>', name.replace(' ', '&nbsp;'), '</span>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag tagedit edit ' + data.kind.getNumber(kind) + '">',
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
		handler = typeof handler === 'function' ? handler : function () {};
		
		var self = getSelf($(this)),
				tag = self.tag(),
				mediaid = self.mediaid(),
				mediaids, filter;

		function onSuccess() {
			handler.call(self, mediaids, tag);
		}
		
		switch (controls.tag.scope(event)) {
		case 'single':
			// affecting tag on one specific video
			mediaids = [self.mediaid()];
			service(mediaid, tag, null, null, onSuccess);
			break;
		case 'all':
			// affecting all tags like this one
			if (window.confirm(lang.all)) {
				mediaids = cache.mget(['tag', tag, 'media', '*'], {mode: flock.keys});
				service(null, tag, null, null, onSuccess);
			}
			break;
		case 'search':
			// affecting tags in search reaults
			filter = controls.search.filter();
			if (filter.length && window.confirm(lang.hits)) {
				mediaids = data.media.stack()[0].data.cache.mget(['media', '*'], {mode: flock.keys});
				service(null, tag, controls.search.filter(), null, onSuccess);
			}
			break;
		case 'selected':
			// affecting all tags on selected videos
			if (window.confirm(lang.sel)) {
				mediaids = jOrder.keys(controls.media.selected);
				service(null, tag, null, mediaids.join(','), onSuccess);
			}
			break;
		}
	}
	
	// tag remove event handler
	function onRemove(event) {
		var self = getSelf($(this));

		onButton.call(this, event, services.tag.del, {
			sel: "Delete this tag from SELECTED videos?",
			all: "Delete ALL tags of this kind?",
			hits: "Delete this tag from SEARCH results?"
		}, function (mediaids, tag) {
			data.media.removeTag(mediaids, tag);
			if (mediaids.length > 1) {
				controls.media.refreshTags();
			} else {
				self.refresh();
			}
		});
		return false;
	}

	function explode(tag) {
		var tmp = tag.split(':'),
				names = tmp[0].split(' '),
				kind = tmp[1] || '',
				result = [],
				i;
		for (i = 0; i < names.length; i++) {
			result.push(names[i] + ':' + kind);
		}
		return result;
	}
	
	// tag explode (split) event handler
	function onExplode(event) {
		var self = getSelf($(this));
		
		onButton.call(this, event, services.tag.explode, {
			sel: "Explode this tag in SELECTED videos?",
			all: "Explode ALL tags of this kind?",
			hits: "Explode this tag in SEARCH results?"
		}, function (mediaids, tag) {
			var tmp = explode(tag),
					i;
			data.media.removeTag(mediaids, tag);
			for (i = 0; i < tmp.length; i++) {
				data.media.addTag(mediaids, tmp[i]);
			}
			if (mediaids.length > 1) {
				controls.media.refreshTags();
			} else {
				self.refresh();
			}
		});
		return false;
	}
	
	// tag change event handler
	function onChange(event) {
		var $this = $(this),
				self = getSelf($this),
				mediaid = self.mediaid(),
				tag = self.tag(),
				before = tag,
				after = data.tag.sanitize($this.val());
		
		if (event.which === 13) {
			// enter - saving values
			// discarding changes when there was no change or tag deleted
			if (after === before || !after.length) {
				return;
			}
			
			scope:
			switch (controls.tag.scope(event)) {
			case 'all':
				// running batch tag change
				if (window.confirm("Apply change to ALL tags of this kind?")) {
					services.tag.set(null, before, after, function () {
						data.tag.set(before, after);
						controls.media.refreshTags();
					});
				}
				break scope;
			case 'search':
				// search scope is not defined for editing
				break scope;
			case 'selected':
				// selected scope is not defined for editing				
				break scope;
			case 'single':
				// running single tag change
				services.tag.set(mediaid, before, after, function () {
					self.changetag(before, after);
				});
				break scope;
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
	flock,
	app.data.cache,
	app.services,
	app.data);

