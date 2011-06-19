////////////////////////////////////////////////////////////////////////////////
// Tag Kinds Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */
var yalp = yalp || {};

yalp.data = function (data, jOrder, services) {
	data.kinds = function () {
		var self = {
			table: null,
			lookup: {},

			// initializes data object: calls service, populates table
			init: function (handler) {
				services.getkinds(function (json) {
					self.table = jOrder(json.data)
						.index('kind', ['kind']);
					self.lookup = self.table.index('kind').flat();

					if (handler) {
						handler();
					}
				});
				return self;
			},

			// retrieves the number assigned to the kind
			getNumber: function (kind) {
				// making sure the default color is not used again
				var lookup = self.lookup[kind],
						value = lookup > 0 ? (lookup - 1) % 11 + 1 : 0;
				return 'kind' + value;
			}
		};

		return self;
	}();
	
	return data;
}(yalp.data || {},
	jOrder,
	yalp.services);

