////////////////////////////////////////////////////////////////////////////////
// Tag Kinds Data
////////////////////////////////////////////////////////////////////////////////
/*global flock, jOrder */
var app = app || {};

app.data = function (data, jOrder, cache, services) {
	var kinds,
			lookup;
	
	function refresh() {
		kinds = jOrder.keys(cache.get(['kind'])).sort();
		lookup = {};
		var i;
		for (i = 0; i < kinds.length; i++) {
			lookup[kinds[i]] = i % 12 + 1;
		}
	}
	
	data.kind = function () {
		var self = {
			// gets or creates a new entry in the kind index
			get: function (kind) {
				var path = ['kind', kind],
						ref = cache.get(path);
				if (!ref) {
					ref = {};
					cache.set(path, ref);
					refresh();
				}
				return ref;
			},

			// removes kind from cache
			unset: function (before) {
				cache.unset(['kind', before]);
				refresh();
			},
			
			// retrieves the number assigned to the kind
			getNumber: function (kind) {
				// making sure the default color is not used again
				if (kind === '') {
					return 'kind0';
				} else {
					if (!lookup) {
						refresh();
					}
					return 'kind' + lookup[kind];
				}
			}
		};

		return self;
	}();
	
	return data;
}(app.data || {},
	jOrder,
	app.data.cache || (app.data.cache = flock()),
	app.services);

