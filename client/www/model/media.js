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

app.model = function (model, jOrder, flock, cache, services) {
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
	
	// container for unfiltered data
	unfiltered = {
		cache: null,
		json: null
	},
	
	// FIFO stack search results
	stack = [{
		term: '',
		data: {}
	}];

	function stackInit(cache, json) {
		json = json || jOrder.values(cache.root().media);
		
		// setting up jOrder table
		// required for paging
		var table = jOrder(preprocess(json))
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
	}
	
	model.media = {
		stack: function () {
			return stack;
		},

		// initializes data object: calls service, populates cache
		init: function (handler) {
			// calling service
			services.media.get('', function (json) {
				json = preprocess(json.data);
				
				var i, row,
						j, tag,
						tags, keywords, rating;
				
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
					
					// backing up original tags & keywords arrays
					tags = row.tags;
					keywords = row.keywords;
					rating = row.rating || '';
					
					// resetting tags & keywords array
					row.tags = {};
					row.keywords = {};
					delete row.rating;
					
					// storing media node in cache
					cache.set(['media', row.mediaid], row);
					
					// setting properties
					model.media.setRating(row, rating);
					model.media.addTags(row, tags);
					model.media.addKeywords(row, keywords);
				}
				
				// storing unfiltered data for quick access
				unfiltered = {
					cache: cache,
					json: json
				};
				
				// initializing stack with original cache & orig. flat json
				stackInit(cache, json);
				
				if (typeof handler === 'function') {
					handler();
				}
			});
			return model.media;
		},

		// resets search stack
		reset: function () {
			if (stack.length > 1) {
				// clearing stack
				stack.splice(0, stack.length - 1);
				return true;
			} else {
				// stack was already empty, nothing happens
				return false;
			}
		},
		
		// filters stack using a given path
		// - path: array representing tree cache path
		filter: function (path) {
			if (!path.length) {
				// re-initializing stack w/ unfiltered data
				stackInit(unfiltered.cache, unfiltered.json);
				return true;
			} else if (path.join('.') === stack[0].path) {
				// filter is same as before
				return false;
			}
			
			var hits = cache.mget(path.concat([null, 'media', '*']), {mode: flock.both});

			// initializing stack with filtered values
			stackInit(flock({
				media: hits
			}));
			
			return true;
		},
		
		// filters current state further
		// - expression: filter expression, comma-separated
		// returns a flag indicating if the result set changed
		search: function (expression) {
			// handling empty search expression
			if (!expression.length) {
				return model.media.reset();
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
				tags = model.search.word(term, true);
				
				// taking _all_ media ids where tags match, then
				matches = cache.mget(['tag', tags, 'media', '*'], {mode: flock.keys});

				// matching media ids against previous search results
				hits = stack[0].data.cache.mget(['media', matches], {mode: flock.both});

				// adding search hits to stack
				stack.unshift({
					term: term,
					tags: tags,
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
		
		// returns a list of tags matching the filter
		matchedTags: function () {
			return flock(stack).mget('*.tags.*');
		},
		
		// returns a list of mediaids matching the current filter
		matchedMedia: function () {
			return stack[0].data.cache.mget(['media', '*'], {mode: flock.keys});
		},
		
		// returns all media ids
		getByTag: function (tag) {
			return cache.mget(['tag', tag, 'media', '*'], {mode: flock.keys});
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

		// adds keywords to cache
		// - mediaid: media id to add keywords to
		// - keywords: array of keywords in original (server) format
		addKeywords: function (mediaid, keywords) {
			var media, i, keyword, ref;
			
			if (typeof mediaid === 'object') {
				media = mediaid;
				mediaid = media.mediaid;
			} else {
				media = cache.get(['media', mediaid]);
			}
			
			for (i = 0; i < keywords.length; i++) {
				keyword = keywords[i];
				ref = model.keyword.get(keyword);
				if (!media.keywords.hasOwnProperty(keyword)) {
					// adding tag reference to media
					media.keywords[keyword] = ref;
					
					// adding media reference to tag
					ref.media[mediaid] = media;
					ref.count++;
				}
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
				ref = model.tag.get(tag);
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
					ref = model.tag.get(tag),												// reference to tag
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
					model.tag.unset(tag);
				}
			}
		},
		
		// sets rating on media entry
		setRating: function (row, rating) {
			var mediaid = row.mediaid,
					rate_path = ['media', mediaid, 'rating'],
					current = cache.get(rate_path),
					ref;
			
			if (rating !== current) {
				// on media node
				cache.set(rate_path, rating);
				
				// removing entry from old rating on index
				if (typeof current !== 'undefined') {
					ref = cache.get(['rating', current]);
					if (typeof ref !== 'undefined') {
						delete ref.media[mediaid];
						ref.count--;
					
						// removing rating altogether
						if (ref.count === 0) {
							cache.unset(['rating', current]);
						}
					}
				}
				
				// adding  entry to new rating on index
				ref = cache.get(['rating', rating]);
				if (typeof ref === 'undefined') {
					ref = {
						count: 0,
						media: {}
					};
					cache.set(['rating', rating], ref);
				}
				ref.media[mediaid] = row;
				ref.count++;
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
							switch (key) {
							case 'keywords':
								model.media.addKeywords(mediaid, diff[key]);
								break;
							case 'hash':
								cache.set(['media', mediaid, key], diff[key]);
								break;
							}
						}
					}
				}
			}
		}
	};
	
	return model;
}(app.model || {},
	jOrder,
	flock,
	app.cache || (app.cache = flock()),
	app.services);

