////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
var app = app || {};

app.data = function (data, services) {
	// selects best hit from an array of hits passed
	function bestHit(hits) {
		throw "Unimplemented";
	}
	
	data.tags = function () {
		var self = {
			// retrieves the first matching tag to a search term
			searchTag: function (term) {
				var hits = data.cache.multiget(['search'].concat(term.toLowerCase().split('')).concat(['', 'tag']));
				return hits[0] || '';
			},
			
			// retrieves the first matching name (kind is ignored)
			searchName: function (term) {
				var hits = data.cache.multiget(['search'].concat(term.toLowerCase().split('')).concat(['', 'name']));
				return hits[0] || '';
			}
		};

		return self;
	}();
	
	return data;
}(app.data,
	app.services);

