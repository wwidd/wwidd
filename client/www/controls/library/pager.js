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
			return self;
		};
		
		function refresh() {
			controls.library
				.reset()
				.build()
				.render();
			self.render();
			controls.url.set();
			return false;
		}
		
		//////////////////////////////
		// Event handlers

		function onChange() {
			page = $(this).val();
			refresh();
		}
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

		self.init = function (elem) {
			elem
				.find('a.first').click(onFirst).end()
				.find('a.prev').click(onPrev).end()
				.find('a.next').click(onNext).end()
				.find('a.last').click(onLast).end()
				.find('select').change(onChange).end();
		};
		
		self.html = function () {
			max = data.media.getPages(items);

			// returning empty control on no data
			if (max <= 1) {
				return '<span id="' + self.id + '"></span>';
			}
			
			// re-setting page in case pager is out of bounds
			if (page > max) {
				page = 0;
			}

			var options = [],
					j, row;
	
			// adding options
			for (j = 0; j < max; j++) {
				row = data.media.getFirst(j, items)[0];
				options.push([
					'<option value="', j, '"', j === parseInt(page, 10) ? ' selected="selected"' : '', '>',
					(j + 1) + " - " + row.file.substr(0, 5) + "...",
					'</option>'
				].join(''));
			}

			return [
				'<span class="pager" id="' + self.id + '">',
				'<a class="first" href="#" title="First"></a>',
				'<a class="prev" href="#" title="Previous"></a>',
				'<select>', options.join(''), '</select>',
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

