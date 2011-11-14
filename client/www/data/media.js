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
					data.media.addTags(row, tags);
				}
				
				// setting up jOrder table
				// required for paging
				table = jOrder(preprocess(json))
					.index('id', ['mediaid'])
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
							.index('id', ['mediaid'])
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
		
		// removes a set of media entries from the cache
		// - mediaids: array of numeric media ids
		unset: function (mediaids) {
			var media = flock(cache.mget(['media', mediaids])),
					i;
			
			// removing media references from tags
			media.munset(['tag', '*', 'media', mediaids]);
			
			// removing media entries
			for (i = 0; i < stack.length; i++) {
				stack[i].data.table.remove(media.root(), {indexName: 'id'});
				stack[i].data.cache.munset(['media', mediaids]);
			}
		},
		
		// adds many tags to one media entry
		// - mediaid: media id (numeric) or media entry (object)
		// - tags: array of tag strings to add
		addTags: function (mediaid, tags) {
			var media, i, tag, ref;
			
			if (typeof mediaid === 'object') {
				media = mediaid;
				mediaid = media.mediaid;
			} else {
				media = cache.get(['media', mediaid]);
			}
			
			for (i = 0; i < tags.length; i++) {
				tag = tags[i];
				ref = data.tag.get(tag);
				if (!media.tags.hasOwnProperty(tag)) {
					// adding tag reference to media
					media.tags[tag] = ref;
					
					// adding media reference to tag
					ref.media[mediaid] = media;
					ref.count++;
				}
			}
		},
	
		// adds one tag to many media entries
		// - mediaids: array of numeric media ids
		// - tag: tag to add to entry (string)
		addTag: function (mediaids, tag) {
			var path = ['media', mediaids, 'tags', tag],				// path to this tag on all affected entries
					media = cache.mget(['media', mediaids]),				// media entries affected
					ref = data.tag.get(tag),												// reference to tag
					i, mediaid;

			// setting tag references on media
			cache.mset(path, ref);
			
			// adding / updating media references on tag
			for (i = 0; i < mediaids.length; i++) {
				mediaid = mediaids[i];
				if (!ref.media.hasOwnProperty(mediaid)) {
					ref.media[mediaid] = media[i];
					ref.count++;
				}
			}
		},
		
		// removes tag from media entries
		// - mediaids: array of numeric media ids
		// - tag: tag to remove from entry (string)
		removeTag: function (mediaids, tag) {
			var path = ['media', mediaids, 'tags', tag],				// path to this tag on all affected entries
					tags = cache.mget(path),												// tags affected by removal
					ref;
			
			// removing tag from medium if present
			if (tags.length) {
				ref = cache.get(['tag', tag]);
				
				// removing direct references
				cache.munset(['media', mediaids, 'tags', tag]);
				cache.munset(['tag', tag, 'media', mediaids]);
				
				// deducting the number of tags actually removed
				ref.count -= tags.length;
				
				// removing tag altogether
				if (Object.isEmpty(ref.media)) {
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
		}
	};
	
	return data;
}(app.data || {},
	jOrder,
	flock,
	app.data.cache || (app.data.cache = flock()),
	app.services);

