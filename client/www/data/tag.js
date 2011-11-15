////////////////////////////////////////////////////////////////////////////////
// Tag List
//
// Performs certain operations on a comma separated list of tags.
////////////////////////////////////////////////////////////////////////////////
/*global flock */
var app = app || {};

app.data = function (data, flock, cache) {
	var RE_SEPARATOR = /\s*[^A-Za-z0-9:\s]+\s*/;
	
	// adds tag to cache
	function add(tag, ref) {
		// adding node to cache
		cache.set(['tag', tag], ref);
		
		// adding node to kinds index
		data.kind.get(ref.kind)[ref.name] = ref;
		
		// adding node to basic indexes
		cache.set(['name', ref.name, ref.kind], ref);
		cache.set(['search'].concat(tag.toLowerCase().split('').concat(['tag'])), ref);
	}
	
	// tag collection
	data.tag = {
		// splits string along non-word parts
		split: function (names) {
			return names.split(RE_SEPARATOR);
		},
		
		// removes separators from string
		sanitize: function (names) {
			return names.split(RE_SEPARATOR).join('');
		},
		
		// tells if any of the tags match the submitted name
		match: function (names, name) {
			var tags = names.split(RE_SEPARATOR),
					re, i;
			
			// no match when tags is empty
			if (!tags.length || tags.length === 1 && !tags[0].length) {
				return false;
			}

			for (i = 0; i < tags.length; i++) {
				re = new RegExp('^' + tags[i] + '.*$', 'i');
				if (name.match(re)) {
					return true;
				}
			}
			return false;
		},
		
		// gets or creates a new tag node and adds it to the index
		// - tag: complete tag string ("name:kind")
		get: function (tag) {
			var path_tag = ['tag', tag],
					ref = cache.get(path_tag),
					tmp;
	
			if (typeof ref === 'undefined') {
				// creating node
				tmp = tag.split(':');
				ref = {
					tag: tag,
					name: tmp[0],
					kind: tmp[1],
					media: {},
					count: 0
				};
				
				// adding node to cache
				add(tag, ref);
			}
			
			return ref;
		},
		
		// changes a tag across the entire library, updates indexes
		// - before: current tag value (string)
		// - after: new tag value (string)
		set: function (before, after) {
			if (before === after) {
				return;
			}
			
			var ref = cache.get(['tag', before]),
					tag = flock(ref),
					tmp = after.split(':');
			
			// updating basic tag data
			ref.tag = after;
			ref.name = tmp[0];
			ref.kind = tmp[1];
			
			// removing reference from old tag
			data.tag.unset(before);
	
			// adding reference to new tag
			add(after, ref);
			
			// moving tag reference to new key under affected media entries
			tag.mset(['media', '*', 'tags', after], ref);
		},
		
		// removes tag from cache altogether, updating indexes
		// - before: current tag value (string)
		unset: function (before) {
			var ref = cache.get(['tag', before]),
					tag = flock(ref),
					tmp = before.split(':');
			
			// removing references from affected media entries
			tag.munset(['media', '*', 'tags', before]);
			
			// removing tag from cache
			cache.unset(['tag', before]);

			// removing references from indexes
			cache.unset(['name', tmp[0], tmp[1]]);
			cache.unset(['kind', tmp[1], tmp[0]]);
			cache.unset(['search'].concat(before.toLowerCase().split('')).concat(['tag']));
	
			// removing name altogether
			if (Object.isEmpty(cache.get(['name', tmp[0]]))) {
				cache.unset(['name', tmp[0]]);
			}
			// removing kind altogether
			if (Object.isEmpty(cache.get(['kind', tmp[1]]))) {
				data.kind.unset(tmp[1]);
			}						
		}
	};
	
	return data;
}(app.data || {},
	flock,
	app.data.cache || (app.data.cache = flock()));

