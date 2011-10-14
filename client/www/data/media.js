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

app.data = function (data, jOrder, flock, services) {
	// initializing cache
	data.cache = data.cache || flock();
	
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
	
	data.media = function () {
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function (filter, handler) {
				handler = handler || function () {};
				services.media.get(filter, function (json) {
					json = preprocess(json.data);
					
					var cache = data.cache,
							i, row,
							j, tag,
							tags;
					
					// setting up datastore roots
					cache.set('tag', {});
					cache.set('media', {});
					cache.set('keyword', {});
					cache.set('kind', {});
					cache.set('name', {});
					cache.set('rating', {});
					cache.set('field', {});
					cache.set('search', {});
					
					// loading media data into cache
					for (i = 0; i < json.length; i++) {
						row = json[i];		// quick reference
						tags = row.tags;	// backup of flat tags
						row.tags = {};		// tags field will be rewritten
						
						// storing media node in cache
						cache.set(['media', row.mediaid], row);
						
						// setting properties
						self.setRating(row);
						for (j = 0; j < tags.length; j++) {
							self.addTag(row, tags[j]);
						}
					}
					
					// setting up jOrder table
					// required for paging
					self.table = jOrder(preprocess(json))
						.index('pager', ['lfile'], {ordered: true, grouped: true, type: jOrder.string});
						
					handler();
				});
				return self;
			},

			// retrieves a reference to the data associated with a media entry
			getRow: function (mediaid) {
				return data.cache.get(['media', mediaid]) || {};
			},
			
			// adds a tag to media entry
			addTag: function (row, tag) {
				var cache = data.cache,
						mediaid = row.mediaid,
						ref, tmp,
						path_media_tag = ['media', mediaid, 'tags', tag],
						path_tag = ['tag', tag];

				if (cache.get(path_media_tag) !== tag) {
					// creating new tag
					ref = cache.get(path_tag);
					if (typeof ref === 'undefined') {
						tmp = tag.split(':');
						ref = {
							tag: tag,
							name: tmp[0],
							kind: tmp[1],
							media: {},
							count: 0
						};
						cache.set(path_tag, ref);
						cache.set(['name', tmp[0], tmp[1]], ref);
						cache.set(['kind', tmp[1], tmp[0]], ref);
						cache.set(['search'].concat(tag.toLowerCase().split('').concat(['tag'])), ref);
					}
					
					// setting references
					cache.set(path_media_tag, ref);
					ref.media[mediaid] = row;
					ref.count = ref.count + 1;
					
					// tag was added
					return true;
				} else {
					// tag was not added
					return false;
				}
			},
			
			// removes tag from media entry
			removeTag: function (mediaid, tag) {
				var cache = data.cache,
						tmp;

				// removing tag from medium if present
				if (typeof cache.get(['media', mediaid, 'tags', tag]) !== 'undefined') {
					// removing direct references
					cache.unset(['media', mediaid, 'tags', tag]);
					cache.unset(['tag', tag, 'media', mediaid]);
					cache.set(['tag', tag, 'count'], cache.get(['tag', tag, 'count']) - 1);
					
					// removing tag altogether
					if (isEmpty(cache.get(['tag', tag, 'media']))) {
						tmp = tag.split(':');
						cache.unset(['tag', tag]);
						cache.unset(['name', tmp[0], tmp[1]]);
						cache.unset(['kind', tmp[1], tmp[0]]);
						cache.unset(['search'].concat(tag.toLowerCase().split('')).concat(['tag']));

						// removing name altogether
						if (isEmpty(cache.get(['name', tmp[0]]))) {
							cache.unset(['name', tmp[0]]);
						}
						// removing kind altogether
						if (isEmpty(cache.get(['kind', tmp[1]]))) {
							cache.unset(['kind', tmp[1]]);
						}						
					}
					
					// tag was removed
					return true;
				} else {
					// tag was not removed
					return false;
				}
			},
			
			// sets rating on media entry
			setRating: function (row, rating) {
				var cache = data.cache,
						mediaid = row.mediaid,
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
				return self.table ? 
					self.table.orderby(['lfile'], jOrder.asc, {offset: page * items, limit: items, renumber: true}) :
					[];
			},
			
			// returns first row of page
			getFirst: function (page, items) {
				return self.table ?
					self.table.orderby(['lfile'], jOrder.asc, {offset: page * items, limit: 1, renumber: true}) :
					[{}];
			},
			
			// returns total number of pages in dataset
			getPages: function (items) {
				return self.table ? 
					Math.ceil(self.table.count() / items) :
					0;
			},
			
			// updates hashes for media entries
			// - diffs: object containing fields to update, indexed by media id
			//	 format: {mediaid: media record}}
			// should be called 'merge'
			update: function (diffs) {
				var cache = data.cache,
						mediaid, diff,
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

				return self;
			}
		};

		return self;
	}();
	
	return data;
}(app.data || {},
	jOrder,
	flock,
	app.services);

