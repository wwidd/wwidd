////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.pager = function (handler) {
		var self = Object.create(controls.control);

		// members
		self.page = 0;
		self.items = 25;
		
		// dropdown representation
		self.getUI = function () {
			return $('<select />')
				.append(function () {
					var result = [],
							table = data.media.table,
							flat = table.flat(),
							i, j, row;
					for (i = 0, j = 0; i < flat.length; i += self.items, j++) {
						row = table.orderby(['file'], jOrder.asc, {offset: i, limit: 1, renumber: true})[0];
						result.push($('<option />', {
							value: j,
							selected: j === parseInt(self.page, 10) ? 'selected' : null
						}).text((j + 1) + " - " + row.file.substr(0, 5))[0]);
					}
					return $(result);
				}())
				.change(function () {
					self.page = $(this).val();
					if (handler) {
						handler();
					}
				});
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	data);

