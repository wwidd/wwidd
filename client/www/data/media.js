////////////////////////////////////////////////////////////////////////////////
// Media Data
//
// Based on Flock (https://github.com/wwidd/flock).
// Until the server stores data in a NoSQL way, the client
// has to build the NoSQL cache in this class. This makes page initialization
// on high media and tag count a bit slow (2-3s on netbooks, tablets).
// Once SQLite is ditched on the server, the JSON can come unaltered and
// there would be no need to use Flock for building the cache.
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, flock, escape */
var app = app || {};

app.data = function (data, jOrder, flock, cache, services) {
	// checks whether an object has any properties
	function isEmpty(obj) {
		var key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}
	
	// extracts filename from path
	function splitPath(path) {
		var bits = path.split('/');
		return {
			file: bits.pop()
		};
	}
	
	// preprocesses video metadata
	function preprocess(json) {
		var i, row, fileInfo;
		for (i = 0; i < json.length; i++) {
			row = json[i];
			fileInfo = splitPath(row.path);
			row.file = fileInfo.file;
			row.lfile = fileInfo.file.toLowerCase();
		}
		return json;
	}
	
	var
		
	// FIFO stack search results
	stack = [{
		term: '',
		data: {}
	}];
	
	data.media = {
		stack: function () {
			return stack;
		},

		// initializes data object: calls service, populates cache
		init: function (handler) {
			handler = handler || function () {};
			
			// calling service
			services.media.get('', function (json) {
				json = preprocess(json.data);
				
				var i, row,
						j, tag,
						tags,
						table;
				
				// setting up datastore roots
				cache.set('tag');
				cache.set('media');
				cache.set('keyword');
				cache.set('kind');
				cache.set('name');
				cache.set('rating');
				cache.set('field');
				cache.set('search');
				
				// loading media data into cache
				for (i = 0; i < json.length; i++) {
					row = json[i];		// quick reference
					tags = row.tags;	// backup of flat tags
					row.tags = {};		// tags field will be rewritten
					
					// storing media node in cache
					cache.set(['media', row.mediaid], row);
					
					// setting properties
					data.media.setRating(row);
					for (j = 0; j < tags.length; j++) {
						data.media.addTag(row, tags[j]);
					}
				}
				
				// setting up jOrder table
				// required for paging
				table = jOrder(preprocess(json))
					.index('pager', ['lfile'], {ordered: true, grouped: true, type: jOrder.string});
					
				// initializing stack
				stack = [{
					term: '',
					data: {
						cache: cache,
						table: table
					}
				}];
				
				handler();
			});
			return data.media;
		},

		// filters current state further
		// - expression: filter expression, comma-separated
		// returns a flag indicating if the result set changed
		filter: function (expression) {
			// handling empty search expression
			if (!expression.length) {
				if (stack.length > 1) {
					// clearing stack
					stack.splice(0, stack.length - 1);
					return true;
				} else {
					// stack was already empty, nothing happens
					return false;
				}
			}
			
			var terms = (',' + expression).split(','), term,
					tstack = jOrder.shallow(stack).reverse(),
					tags, matches, hits,
					i,
					result = false;

			// stack can't be longer than terms
			if (stack.length > terms.length) {
				stack.splice(0, stack.length - terms.length);
				result = true;
			}
			
			// skipping already processed search terms
			skipper:
			for (i = 1; i < terms.length; i++) {
				if (i >= stack.length) {
					// stack is shorter than terms, continuing below
					result = true;
					break skipper;
				} else if (terms[i] !== tstack[i].term) {
					// cutting stack at first non-matching term
					stack.splice(0, stack.length - i);
					result = true;
					break skipper;
				}
			}
			
			// processing terms that differ from what's already on the stack
			for (; i < terms.length; i++) {
				// taking next term
				term = terms[i];
				
				// acquiring tags matching the entered string
				tags = cache.mget(['search'].concat(term.toLowerCase().split('')).concat(['', 'tag', 'tag']));
				
				// acquiring search hits
				if (stack.length === 1) {
					// performing direct query on first search term
					hits = cache.mget(['tag', tags, 'media', '*'], {mode: flock.both});
				} else {
					// performing two-stage query on subsequent terms
					// first, taking _all_ media ids where tags match, then
					// matching them against previous search results
					matches = cache.mget(['tag', tags, 'media', '*'], {mode: flock.keys});
					hits = stack[0].data.cache.mget(['media', matches], {mode: flock.both});
				}

				// adding search hits to stack
				stack.unshift({
					term: term,
					data: {
						cache: flock({
							media: hits
						}),
						table: jOrder(jOrder.values(hits))
							.index('pager', ['lfile'], {ordered: true, grouped: true, type: jOrder.string})
					}
				});
			}
			
			return result;
		},
		
		// retrieves a reference to the data associated with a media entry
		getRow: function (mediaid) {
			return cache.get(['media', mediaid]) || {};
		},
		
		// adds a tag to media entry
		addTag: function (row, tag) {
			var mediaid = row.mediaid,
					path_media_tag = ['media', mediaid, 'tags', tag],
					ref = cache.get(path_media_tag);

			if (ref !== tag) {
				// media entry has no such tag yet
				// getting or creating new tag
				ref = data.tag.get(tag);
				
				// setting references
				cache.set(path_media_tag, ref);
				ref.media[mediaid] = row;
				ref.count = ref.count + 1;
			}
		},
				
		// removes tag from media entry
		removeTag: function (mediaid, tag) {
			// removing tag from medium if present
			if (typeof cache.get(['media', mediaid, 'tags', tag]) !== 'undefined') {
				// removing direct references
				cache.unset(['media', mediaid, 'tags', tag]);
				cache.unset(['tag', tag, 'media', mediaid]);
				cache.set(['tag', tag, 'count'], cache.get(['tag', tag, 'count']) - 1);
				
				// removing tag altogether
				if (isEmpty(cache.get(['tag', tag, 'media']))) {
					data.tag.unset(tag);
				}
			}
		},
		
		// sets rating on media entry
		setRating: function (row, rating) {
			var mediaid = row.mediaid,
					rate_path = ['media', mediaid, 'rating'],
					current = cache.get(rate_path);

			// new rating value
			rating = rating || row.rating;
			
			if (rating !== current.rating) {
				// on media node
				cache.set(rate_path, rating);
				
				// rating lookup
				cache.unset(['rating', current.rating, mediaid]);
				cache.set(['rating', rating, mediaid], row);
				
				// rating was changed
				return true;
			} else {
				// rating was not changed
				return false;
			}
		},
		
		// retrieves one page from the table
		getPage: function (page, items) {
			var table = stack[0].data.table;
			return table ? 
				table.orderby(['lfile'], jOrder.asc, {offset: page * items, limit: items, renumber: true}) :
				[];
		},
		
		// returns first row of page
		getFirst: function (page, items) {
			var table = stack[0].data.table;
			return table ?
				table.orderby(['lfile'], jOrder.asc, {offset: page * items, limit: 1, renumber: true}) :
				[{}];
		},
		
		// returns total number of pages in dataset
		getPages: function (items) {
			var table = stack[0].data.table;
			return table ? 
				Math.ceil(table.count() / items) :
				0;
		},
		
		// updates hashes for media entries
		// - diffs: object containing fields to update, indexed by media id
		//	 format: {mediaid: media record}}
		// should be called 'merge'
		update: function (diffs) {
			var mediaid, diff,
					key;

			for (mediaid in diffs) {
				if (diffs.hasOwnProperty(mediaid) &&
						typeof cache.get(['media', mediaid]) !== 'undefined') {
					// it is possible that the mediaid being polled is not loaded ATM
					diff = diffs[mediaid];
					for (key in diff) {
						if (diff.hasOwnProperty(key)) {
							// WARNING: diff[key] can be object or array,
							// requiring cross-references to be created
							cache.set(['media', mediaid, key], diff[key]);
						}
					}
				}
			}

			return data.media;
		}
	};
	
	return data;
}(app.data || {},
	jOrder,
	flock,
	app.data.cache || (app.data.cache = flock()),
	app.services);

