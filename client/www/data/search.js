////////////////////////////////////////////////////////////////////////////////
// Search Index
//
// Builds and queries search tree.
////////////////////////////////////////////////////////////////////////////////
/*global flock */
var app = app || {};

app.data = function (data, flock, cache) {
	var ROOT_FULL = ['search', 'full'],		// cache root for string prefix search
			ROOT_WORD = ['search', 'word'],		// cache root for word prefix search
			RE_SPLIT_COLON = /\s*:\s/,				// regex that splits along padded colons
			RE_SPLIT_CHAR = '';								// regex that splits along each character
	
	// tag collection
	data.search = {
		// gets nodes fitting search criteria
		// - str: string to search for
		// - path: relative node path
		get: function (str, path) {
			var full = str.toLowerCase();
			return cache.mget(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(['']).concat(path || ['tag']));
		},
		
		// sets nodes on search tree
		// - str: string to search for
		// - node: node to set
		// - path: relative node path
		set: function (str, node, path) {
			var full = str.toLowerCase();
			cache.set(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR).concat(path || ['tag'])), node);
		},
		
		// removes a node from the search index
		// - str: search string to remove
		// - path: relative path to data node
		unset: function (str, path) {
			var	full = str.toLowerCase();
			cache.unset(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path || ['tag']));
		}
	};
	
	return data;
}(app.data || {},
	flock,
	app.data.cache || (app.data.cache = flock()));

