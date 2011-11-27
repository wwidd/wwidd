////////////////////////////////////////////////////////////////////////////////
// Search Index
//
// Builds and queries search tree.
////////////////////////////////////////////////////////////////////////////////
/*global flock */
var app = app || {};

app.data = function (data, flock, cache) {
	var ROOT = ['search'],
			RE_SPLIT_COLON = /\s*:\s/,
			RE_SPLIT_CHAR = '';
	
	// tag collection
	data.search = {
		// gets nodes fitting search criteria
		// - str: string to search for
		// - path: relative node path
		get: function (str, path) {
			path = path || ['tag'];
			var full = str.toLowerCase();
			return cache.mget(ROOT.concat(full.split(RE_SPLIT_CHAR)).concat(['']).concat(path));
		},
		
		// sets tag nodes on search tree
		// - str: string to search for
		// - node: node to set
		setTag: function (str, node) {
			var full = str.toLowerCase();
			cache.set(ROOT.concat(full.split(RE_SPLIT_CHAR).concat(['tag'])), node);
		},
		
		unset: function (str, key) {
			key = key || 'tag';
			var	full = str.toLowerCase();
			cache.unset(ROOT.concat(full.split(RE_SPLIT_CHAR)).concat([key]));
		}
	};
	
	return data;
}(app.data || {},
	flock,
	app.data.cache || (app.data.cache = flock()));

