////////////////////////////////////////////////////////////////////////////////
// Tag Kinds Data
////////////////////////////////////////////////////////////////////////////////
var app = app || {};

app.data = function (data, services) {
	data.kinds = function () {
		var self = {
			lookup: {},

			// initializes data object: calls service, populates table
			init: function (tags, handler) {
				self.lookup = tags.table.index('kind').flat();
				handler();
				return self;
			},

			// retrieves the number assigned to the kind
			getNumber: function (kind) {
				// making sure the default color is not used again
				if (kind === '') {
					return 'kind0';
				}
				var i = 0,
						key, value;
				for (key in self.lookup) {
					if (self.lookup.hasOwnProperty(key)) {
						if (key === kind) {
							value = i % 11 + 1;
							break;
						}
						i++;
					}
				}
				return 'kind' + value;
			}
		};

		return self;
	}();
	
	return data;
}(app.data || {},
	app.services);

