////////////////////////////////////////////////////////////////////////////////
// Media Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */
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
				services.getmedia(filter, function (json) {
					self.table = jOrder(preprocess(json.data))
						.index('mediaid', ['mediaid'], {ordered: true, type: jOrder.number})
						.index('file', ['file_'], {ordered: true, grouped: true, type: jOrder.string})
						.index('tags', ['tags'], {grouped: true, type: jOrder.array});
					handler();
				});
				return self;
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
						keys = [], key;
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
				return self;
			}
		};

		return self;
	}();
	
	return data;
}(app.data || {},
	jOrder,
	app.services);

