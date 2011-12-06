////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, jOrder, window */
var app = app || {};

app.widgets = function (widgets, $, wraith, jOrder, model) {
	var lookup = {},		// lookup object for tagger widgets (by id)
			lastWidth;			// last measured available width for compact view media entry
	
	widgets.tagger = function (mediaid) {
		var	self = wraith.widget.create(),
				base_remove = self.remove,
				adder;
		
		lookup[self.id] = self;
		
		//////////////////////////////
		// Utility functions

		self.add = function () {
			adder.toggle('edit');
		};
		
		//////////////////////////////
		// Overrides

		// compares tags
		// - a,b: tag objects to compare
		function compare(a, b) {
			var akind = (a.kind || '').toLowerCase(),
					bkind = (b.kind || '').toLowerCase(),
					aname, bname;
			if (akind > bkind) {
				return 1;
			} else if (akind < bkind) {
				return -1;
			} else {
				aname = a.name.toLowerCase();
				bname = b.name.toLowerCase();
				if (aname > bname) {
					return 1;
				} else if (aname < bname) {
					return -1;
				} else {
					return 0;
				}
			}
		}
		
		self.build = function () {
			self.clear();

			// adding tag editor widgets in sorted tag order
			var row = model.media.getRow(mediaid),
					tags = jOrder.values(row.tags).sort(compare),
					i;
			for (i = 0; i < tags.length; i++) {
				widgets.tagedit(mediaid, tags[i].tag)
					.appendTo(self);
			}
			
			// adding tag adder widget
			adder = widgets.tagadd(mediaid)
				.appendTo(self);
				
			return self;
		};
		
		self.remove = function () {
			delete lookup[self.id];
			return base_remove.call(self);
		};
		
		self.init = function (elem) {
			widgets.tagger.resize(true, elem);
		};
		
		self.html = function () {
			var result = ['<div id="', self.id, '" class="tagger">'],
					i, child;
			// adding html for tag widgets of visible kinds
			for (i = 0; i < self.children.length; i++) {
				child = self.children[i];
				if (!child.kind || !widgets.kinds.hidden(child.kind())) {
					result.push(child.html());
				}
			}
			result.push('</div>');
			return result.join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static methods

	// resizes tagger widgets to fit screen width
	widgets.tagger.resize = function (force, elem) {
		var $list = $('.w_media.list'),
				$tagger = elem || $list.find('div.tagger'),
				width, full = $list.width(),
				$model,
				left;
				
		if (force ||																// either forced, or,
				(!lastWidth || full !== lastWidth) &&		// last width doesn't match current width, and,
				$tagger.length) {												// there are visible tagger widgets
			// obtaining single tagger for measurement
			$model = $tagger.eq(0);
			
			if ($model.css('position') === 'absolute') {
				// tagger absolutely positioned
				left = $model.position().left;
			} else if ($model.css('display') === 'inline-block') {
				// tagger is inline-block
				// measuring padding + border + margin + scroller
				left = $model.outerWidth(true) - $model.width() + 15;
				
				// counting all previous siblings' width
				$model.prevAll()
					.each(function () {
						left += $(this).outerWidth(true);
					});
			} else {
				// failsafe
				// will look ugly
				left = full;
			}
			
			// setting updated width
			$tagger.width(full - left);

			// updating state indicator
			lastWidth = full;
		}
	};

	// re-renders all visible tagger widgets
	widgets.tagger.render = function () {
		var id;
		for (id in lookup) {
			if (lookup.hasOwnProperty(id)) {
				lookup[id]
					.build()
					.render();
			}
		}
	};

	//////////////////////////////
	// Static event handlers

	function onResize(elem) {
		widgets.tagger.resize();
	}
	
	//////////////////////////////
	// Static event bindings

	$(window).bind('resize', onResize);
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	jOrder,
	app.model);

