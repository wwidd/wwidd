////////////////////////////////////////////////////////////////////////////////
// Media Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, escape */
var app = app || {};

app.data = function (data, jOrder, services) {
	data.media = function () {
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
				row.file_ = fileInfo.file.toLowerCase();
				row.ext = fileInfo.ext;
			}
			return json;
		}
		
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function (filter, handler) {
				handler = handler || function () {};
				services.media.get(filter, function (json) {
					self.table = jOrder(preprocess(json.data))
						.index('mediaid', ['mediaid'], {ordered: true, type: jOrder.number})
						.index('file', ['file_'], {ordered: true, grouped: true, type: jOrder.string})
						.index('tags', ['tags'], {grouped: true, type: jOrder.array});
					handler();
				});
				return self;
			},

			// counts the number of tag occurrences in the whole library
			countTag: function (tag) {
				return self.table.index('tags').count(tag);
			},
			
			// retrieves a reference to the data associated with a media entry
			getRow: function (mediaid) {
				return self.table.where([{mediaid: mediaid}], {renumber: true})[0] || {};
			},
			
			// adds a tag to media entry
			addTag: function (mediaid, tag) {
				var before = self.table.where([{mediaid: mediaid}], {renumber: true})[0],
						after = jOrder.deep(before),
						lookup = jOrder.join(before.tags, []);

				// adding tag to medium when not already present
				if (!lookup.hasOwnProperty(tag)) {
					after.tags.push(tag);
					self.table.update(before, after);
				}
			},
			
			// removes tag from media entry
			removeTag: function (mediaid, tag) {
				var before = self.table.where([{mediaid: mediaid}], {renumber: true})[0],
						after = jOrder.deep(before),
						lookup = jOrder.join(before.tags, []);
				
				// removing tag from medium if present
				if (lookup.hasOwnProperty(tag)) {
					delete lookup[tag];
					after.tags = jOrder.keys(lookup);
					self.table.update(before, after);
				}
			},
			
			// sets rating on media entry
			setRating: function (mediaid, rating) {
				var before = self.table.where([{mediaid: mediaid}], {renumber: true})[0],
						after = jOrder.deep(before);
				
				// removing tag from medium if present
				if (after.rating !== rating) {
					after.rating = rating;
					self.table.update(before, after);
				}			
			},
			
			// retrieves one page from the table
			getPage: function (page, items) {
				return self.table ? 
					self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: items, renumber: true}) :
					[];
			},
			
			// returns first row of page
			getFirst: function (page, items) {
				return self.table ?
					self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: 1, renumber: true}) :
					[{}];
			},
			
			// returns total number of pages in dataset
			getPages: function (items) {
				return self.table ? 
					Math.ceil(self.table.flat().length / items) :
					0;
			},
			
			// updates hashes for media entries
			// WARNING: bypasses jOrder! Only for hashes and keywords for now!
			// - diffs: object containing fields to update, indexed by media id
			//	 format: {mediaid: media record}}
			update: function (diffs) {
				var mediaid,
						before, diff,
						keys, key;
				if (self.table) {
					keys = [];
					for (mediaid in diffs) {
						if (diffs.hasOwnProperty(mediaid)) {
							// to save cpu, fields are updated directly (w/o jOrder.update)
							// works only with hash and keywords
							before = self.table.where([{mediaid: mediaid}], {renumber: true})[0];
							if (typeof before !== 'undefined') {
								// it is possible that the mediaid being polled is not loaded ATM
								diff = diffs[mediaid];
								for (key in diff) {
									if (diff.hasOwnProperty(key)) {
										before[key] = diff[key];								
									}
								}
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
	app.services);

