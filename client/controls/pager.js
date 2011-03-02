////////////////////////////////////////////////////////////////////////////////
// Pager Control
//
// For switching between pages
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, control) {
	controls.pager = function (handler) {
		var self = Object.create(control);

		// members
		self.provider = null;
		self.page = 0;
		self.items = 25;
		
		// dropdown representation
		self.getUI = function () {
			return $('<select />')
				.append(function () {
					var result = [],
							flat = self.provider.table.flat(),
							i, j, row;
					for (i = 0, j = 0; i < flat.length; i += self.items, j++) {
						row = self.provider.table.orderby(['file'], jOrder.asc, {offset: i, limit: 1, renumber: true})[0];
						result.push($('<option />', {
							value: j,
							selected: j === parseInt(self.page, 10) ? 'selected' : null
						}).text(j + " - " + row.file.substr(0, 5))[0]);
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
	controls.control);

