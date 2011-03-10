////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.pager = function () {
		var self = Object.create(controls.control);

		// members
		self.page = 0;
		self.items = 25;
		self.max = 0;
		
		// resets pager to first page
		self.reset = function () {
			self.page = 0;
		};
		
		function refresh() {
			controls.page.redraw();
			self.redraw();
			return false;
		}
		
		// event handlers
		function onChange() {
			self.page = $(this).val();
			controls.page.redraw();
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
		
		// dropdown representation
		self.getUI = function () {
			var options = [],
					j, row;

			self.max = data.media.getPages(self.items);
			if (self.page > self.max) {
				self.page = 0;
			}
			
			// constructing option collection
			for (j = 0; j < self.max; j++) {
				row = data.media.getFirst(j, self.items)[0];
				options.push($('<option />', {
					value: j,
					selected: j === parseInt(self.page, 10) ? 'selected' : null
				}).text((j + 1) + " - " + row.file.substr(0, 5) + "...")[0]);
			}
			
			return $('<span />', {'class': 'pager'})
				.append($('<a />', {'href': '#'})
					.text("<<")
					.click(onFirst))
				.append($('<a />', {'href': '#'})
					.text("<")
					.click(onPrev))
				.append($('<select />')
					.append($(options))
					.change(onChange))
				.append($('<a />', {'href': '#'})
					.text(">")
					.click(onNext))
				.append($('<a />', {'href': '#'})
					.text(">>")
					.click(onLast));
		};

		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	data);

