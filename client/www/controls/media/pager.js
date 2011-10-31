////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, document */
var app = app || {};

app.controls = function (controls, $, data) {
	controls.pager = function () {
		var self = controls.control.create(),
				pages = controls.dropdown(),
				pagesel = controls.select(),
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
			max = data.media.getPages(items);
			for (i = 0; i < max; i++) {
				row = data.media.getFirst(i, items)[0];
				result.push((i + 1) + " - " + row.file.substr(0, 8) + "...");
			}
			return result;
		}
		
		function refresh() {
			controls.media
				.build()
				.render();
			self.render();
			pagesel
				.selected(page)
				.render();
			controls.url.set();
			controls.checker
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
			
			// returning empty control on no data
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
				'<span class="pager" id="' + self.id + '">',
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
			controls.pager.first();
			return false;
		case 34:	// pg down
			controls.pager.next();
			return false;
		case 33:	// pg up
			controls.pager.prev();
			return false;
		case 35:	// end
			controls.pager.last();
			return false;
		}
	});
	
	return controls;
}(app.controls || {},
	jQuery,
	app.data);

