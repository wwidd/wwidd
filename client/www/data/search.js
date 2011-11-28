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
		// - term: string to search for
		// - path: relative node path
		get: function (term, path) {
			var full = term.toLowerCase();
			return cache.mget(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(['']).concat(path || ['tag']));
		},
		
		// gets words that fit the search term
		// - term: search term
		// - orig: whether matching tags should be returned (or just matching words)
		word: function (term, orig) {
			var full = term.toLowerCase(),
					path = ROOT_WORD.concat(full.split(RE_SPLIT_CHAR)).concat(['', 'word', '*']);
			if (typeof orig === 'undefined') {
				return cache.mget(path, {mode: flock.both});
			} else {
				path.push('*');
				return cache.mget(path, {mode: flock.keys});
			}
		},
		
		// sets nodes on search tree
		// - term: string to search for
		// - node: node to set
		// - path: relative node path
		set: function (term, node, path) {
			path = path || ['tag'];
			
			var full = term.toLowerCase(),
					tmp = full.split(RE_SPLIT_COLON),
					name = tmp[0],
					names = name.split(RE_SPLIT_WHITE),
					i;
			
			// adding string prefix index
			cache.set(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path), node);
			
			// inclusion of full tag (w/o kind)
			if (names.length > 1) {
				names.push(tmp[0]);
			}
			
			// adding word prefix index
			for (i = 0; i < names.length; i++) {
				cache.set(ROOT_WORD
					.concat(names[i].split(RE_SPLIT_CHAR))
					.concat(['word', names[i], term])
					.concat(path), node);
			}
		},
		
		// removes a node from the search index
		// - term: search string to remove
		// - path: relative path to data node
		unset: function (term, path) {
			path = path || ['tag'];
			
			var	full = term.toLowerCase(),
					tmp = full.split(RE_SPLIT_COLON),
					name = tmp[0],
					names = name.split(RE_SPLIT_WHITE),
					i;
			
			// removing string prefix nodes
			cache.unset(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path));
			
			// inclusion of full search term (w/o kind)
			if (names.length > 1) {
				names.push(tmp[0]);
			}
					
			// removing word prefix nodes
			for (i = 0; i < names.length; i++) {
				cache.unset(ROOT_WORD
					.concat(names[i].split(RE_SPLIT_CHAR))
					.concat(['word', names[i], term])
					.concat(path));
			}
		}
	};
	
	return data;
}(app.data || {},
	flock,
	app.data.cache || (app.data.cache = flock()));

