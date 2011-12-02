////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, document */
var app = app || {};

app.widgets = function (widgets, $, wraith, model) {
	widgets.pager = function () {
		var self = wraith.widget.create(),
				pages = widgets.dropdown(),
				pagesel = widgets.select(),
				page = 0,
				items = 20,
				max = 0;

		//////////////////////////////
		// Getters, setters

		self.page = function (value) {
			if (typeof value === 'undefined') {
				return page;
			} else {
				page = value;
				return self;
			}
		};
		
		self.items = function () {
			return items;
		};
		
		//////////////////////////////
		// Utility functions

		self.reset = function () {
			page = 0;
			pagesel.selected(page);
			return self;
		};
		
		function getOptions() {
			var result = [],
					row, i;
			max = model.media.getPages(items);
			for (i = 0; i < max; i++) {
				row = model.media.getFirst(i, items)[0];
				result.push((i + 1) + " - " + row.file.substr(0, 8) + "...");
			}
			return result;
		}
		
		function refresh() {
			widgets.media
				.build()
				.render();
			self.render();
			pagesel
				.selected(page)
				.render();
			widgets.url.set();
			widgets.checker
				.render();
			return false;
		}
		
		//////////////////////////////
		// Event handlers

		function onFirst() {
			if (page === 0) {
				return false;
			}
			page = 0;
			return refresh();
		}		
		function onPrev() {
			if (page === 0) {
				return false;
			}
			page--;
			return refresh();
		}		
		function onNext() {
			if (page >= max - 1) {
				return false;
			}
			page++;
			return refresh();
		}
		function onLast() {
			if (page >= max - 1) {
				return false;
			}
			page = max - 1;
			return refresh();
		}
		
		//////////////////////////////
		// External control
		
		self.first = onFirst;
		self.next = onNext;
		self.prev = onPrev;
		self.last = onLast;

		//////////////////////////////
		// Overrides

		self.build = function () {
			pagesel
				.onChange(function (i) {
					// collapsing dropdown
					pages
						.collapse()
						.render();
						
					// adjusting page number
					page = i;
					refresh();
				})
				.selected(page)
				.appendTo(self);
				
			pages
				.popup(pagesel)
				.appendTo(self);
				
			return self;
		};
				
		self.init = function (elem) {
			elem
				.find('a.first').click(onFirst).end()
				.find('a.prev').click(onPrev).end()
				.find('a.next').click(onNext).end()
				.find('a.last').click(onLast).end();
		};
		
		self.html = function () {
			// re-rendering the select dropdown
			pagesel
				.options(getOptions())
				.render();
			
			// returning empty widget on no data
			if (pagesel.options().length <= 1) {
				return '<span id="' + self.id + '"></span>';
			}

			pages
				.caption(pagesel.options()[page]);
			
			// re-setting page in case pager is out of bounds
			if (page > max) {
				page = 0;
			}

			return [
				'<span class="w_pager" id="' + self.id + '">',
				'<a class="first" href="#" title="First"></a>',
				'<a class="prev" href="#" title="Previous"></a>',
				pages.html(),
				'<a class="next" href="#" title="Next"></a>',
				'<a class="last" href="#" title="Last"></a>',
				'</span>'
			].join('');
		};
	
		return self;
	}();
	
	//////////////////////////////
	// Keyboard controls

	$(document).keydown(function (event) {
		// excluding input controls 
		if ($(event.target).is('input')) {
			return;
		}
		
		// handling special keys  
		switch (event.which) {
		case 36:	// home
			widgets.pager.first();
			return false;
		case 34:	// pg down
			widgets.pager.next();
			return false;
		case 33:	// pg up
			widgets.pager.prev();
			return false;
		case 35:	// end
			widgets.pager.last();
			return false;
		}
	});
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	app.model);

