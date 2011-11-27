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
			RE_SPLIT_COLON = /\s*:\s*/,				// regex that splits along padded colons
			RE_SPLIT_CHAR = '',								// regex that splits along each character
			RE_SPLIT_WHITE = /\s+/;						// regex that splits along whitespace
	
	// tag collection
	data.search = {
		// gets nodes fitting search criteria
		// - str: string to search for
		// - path: relative node path
		get: function (str, path) {
			var full = str.toLowerCase();
			return cache.mget(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(['']).concat(path || ['tag']));
		},
		
		// gets words that fit the search term
		// - str: search term
		word: function (str) {
			var full = str.toLowerCase(),
					hits = cache.mget(ROOT_WORD.concat(full.split(RE_SPLIT_CHAR)).concat(['', 'word', '*']), {mode: flock.both}),
					word, count = 0;
			return hits;
		},
		
		// sets nodes on search tree
		// - str: string to search for
		// - node: node to set
		// - path: relative node path
		set: function (str, node, path) {
			path = path || ['tag'];
			
			var full = str.toLowerCase(),
					tmp = full.split(RE_SPLIT_COLON),
					names = tmp[0].split(RE_SPLIT_WHITE),
					i;
			
			// adding string prefix index
			cache.set(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path), node);
			
			// adding word prefix index
			for (i = 0; i < names.length; i++) {
				cache.set(ROOT_WORD
					.concat(names[i].split(RE_SPLIT_CHAR))
					.concat(['word', names[i], full])
					.concat(path), node);
			}
		},
		
		// removes a node from the search index
		// - str: search string to remove
		// - path: relative path to data node
		unset: function (str, path) {
			path = path || ['tag'];
			
			var	full = str.toLowerCase(),
					tmp = full.split(RE_SPLIT_COLON),
					names = tmp[0].split(RE_SPLIT_WHITE),
					i;
					
			// removing string prefix nodes
			cache.unset(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path));
			
			// removing word prefix nodes
			path.push(full);
			for (i = 0; i < names.length; i++) {
				cache.unset(ROOT_WORD
					.concat(full.split(RE_SPLIT_CHAR))
					.concat(['word', names[i], full])
					.concat(path));
			}
		}
	};
	
	return data;
}(app.data || {},
	flock,
	app.data.cache || (app.data.cache = flock()));

