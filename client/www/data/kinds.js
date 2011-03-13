////////////////////////////////////////////////////////////////////////////////
// Tag Kinds Data
////////////////////////////////////////////////////////////////////////////////
var data = function (data, jOrder, services) {
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
				return 'kind' + self.lookup[kind];
			}
		};

		return self;
	}();
	
	return data;
}(data || {},
	jOrder,
	services);

