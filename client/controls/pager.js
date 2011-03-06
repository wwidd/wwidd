////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.pager = function (handler) {
		handler = handler || function () {};
		
		var self = Object.create(controls.control);

		// members
		self.page = 0;
		self.items = 25;
		self.max = 0;
		
		function refresh() {
			handler();
			self.redraw();
			return false;
		}
		
		// event handlers
		function onChange() {
			self.page = $(this).val();
			handler();
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
			if (self.page >= self.max) {
				return false;
			}
			self.page++;
			return refresh();
		}
		function onLast() {
			if (self.page >= self.max) {
				return false;
			}
			self.page = self.max;
			return refresh();
		}
		
		// dropdown representation
		self.getUI = function () {
			var options = [],
					table = data.media.table,
					flat = table.flat(),
					i, j, row;

			self.max = Math.floor(flat.length / self.items);
			if (self.page > self.max) {
				self.page = 0;
			}
			
			// constructing option collection
			for (i = 0, j = 0; i < flat.length; i += self.items, j++) {
				row = table.orderby(['file'], jOrder.asc, {offset: i, limit: 1, renumber: true})[0];
				options.push($('<option />', {
					value: j,
					selected: j === parseInt(self.page, 10) ? 'selected' : null
				}).text((j + 1) + " - " + row.file.substr(0, 5))[0]);
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
	};
	
	return controls;
}(controls || {},
	jQuery,
	data);

