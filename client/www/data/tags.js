////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
var app = app || {};

app.data = function (data, services) {
	// selects best hit from an array of hits passed
	// simple maximum search
	function bestHit(hits) {
		var max = Number.MIN_VALUE, pos,
				i, tmp;
		for (i = 0; i < hits.length; i++) {
			tmp = hits[i].count;
			if (tmp > max) {
				max = tmp;
				pos = i;
			}
		}
		return hits[pos];
	}
	
	// searches for a tag entry associated with the term
	// start-of-word search
	function search(term) {
		return bestHit(data.cache.mget(['search'].concat(term.toLowerCase().split('')).concat(['', 'tag'])));
	}
					
	data.tags = function () {
		var self = {
			// retrieves the first matching tag to a search term
			searchTag: function (term) {
				return (search(term) || {tag: ''}).tag;
			},
			
			// retrieves the first matching name (kind is ignored)
			searchName: function (term) {
				return (search(term) || {name: ''}).name;
			}
		};

		return self;
	}();
	
	return data;
}(app.data,
	app.services);

