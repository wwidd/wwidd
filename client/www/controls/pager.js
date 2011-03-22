////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.controls = function (controls, $, data) {
	controls.pager = function () {
		var self = Object.create(controls.control());

		// members
		self.page = 0;
		self.items = 20;
		self.max = 0;
		
		//////////////////////////////
		// Utility functions

		self.reset = function () {
			self.page = 0;
		};
		
		function refresh() {
			controls.library.render();
			self.render();
			return false;
		}
		
		//////////////////////////////
		// Event handlers

		function onChange() {
			self.page = $(this).val();
			controls.library.render();
		}
		function onFirst() {
			if (self.page === 0) {
				return false;
			}
			self.page = 0;
			return refresh();
		}		
		function onPrev() {
			if (self.page === 0) {
				return false;
			}
			self.page--;
			return refresh();
		}		
		function onNext() {
			if (self.page >= self.max - 1) {
				return false;
			}
			self.page++;
			return refresh();
		}
		function onLast() {
			if (self.page >= self.max - 1) {
				return false;
			}
			self.page = self.max - 1;
			return refresh();
		}
		
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
			// re-setting page in case pager is out of bounds
			self.max = data.media.getPages(self.items);
			if (self.page > self.max) {
				self.page = 0;
			}

			var options = [],
					j, row;
	
			// adding options
			for (j = 0; j < self.max; j++) {
				row = data.media.getFirst(j, self.items)[0];
				options.push([
					'<option value="', j, '"', j === parseInt(self.page, 10) ? ' selected="selected"' : '', '>',
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
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.data);

