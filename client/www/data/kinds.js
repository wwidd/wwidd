////////////////////////////////////////////////////////////////////////////////
// Tag Kinds Data
////////////////////////////////////////////////////////////////////////////////
/*global flock */
var app = app || {};

app.data = function (data, services) {
	data.kinds = function () {
		var self = {
			// retrieves the number assigned to the kind
			getNumber: function (kind) {
				// making sure the default color is not used again
				if (kind === '') {
					return 'kind0';
				}
				var lookup = data.cache.get('kind'),
						i = 0,
						key, value;
				for (key in lookup) {
					if (lookup.hasOwnProperty(key)) {
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

