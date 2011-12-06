////////////////////////////////////////////////////////////////////////////////
// Keyword Model Class
////////////////////////////////////////////////////////////////////////////////
/*global flock */
var app = app || {};

app.model = function (model, flock, cache) {
	// adds keyword to cache
	function add(keyword, ref) {
		// adding node to cache
		cache.set(['keyword', keyword], ref);
		
		// adding node to field index
		cache.set(['field', ref.field, ref.value], ref);
	}

	model.keyword = {
		get: function (keyword) {
			var path = ['keyword', keyword],
					ref = cache.get(path),
					tmp;
	
			if (typeof ref === 'undefined') {
				// creating node
				tmp = keyword.split(':');
				ref = {
					keyword: keyword,
					field: tmp.shift(),
					value: tmp.join(':'),
					media: {},
					count: 0
				};
				
				// adding node to cache
				add(keyword, ref);
			}
			
			return ref;
		}
	};
	
	return model;
}(app.model || {},
	flock,
	app.cache || (app.cache = flock()));

