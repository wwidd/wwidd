////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, escape */
var app = app || {};

app.data = function (data, jOrder, services) {
	data.tags = function () {
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function (handler) {
				services.tag.getall(function (json) {
					// preprocessing tag data
					var i, row;
					for (i = 0; i < json.data.length; i++) {
						row = json.data[i];
						row.lname = row.name.toLowerCase();
						row.tag = row.name + '\t' + row.kind;
						row.ltag = row.tag.toLowerCase();
					}
					
					// building table
					self.table = jOrder(json.data)
						.index('tag', ['ltag'], {ordered: true, type: jOrder.string})
						.index('name', ['lname'], {ordered: true, grouped: true, type: jOrder.string})
						.index('kind', ['kind'], {grouped: true, type: jOrder.string});

					// custom callback
					if (handler) {
						handler();
					}
				});
				return self;
			},

			// adds a new tag
			add: function (name, kind) {
				// preparing tags
				var tag = name + '\t' + kind,
						ltag = tag.toLowerCase();
				
				// adding new tag (lookup key must be escaped)
				if (data.media.countTag(name + ':' + kind) === 0) {
					self.table.insert([{
						tag: tag,
						ltag: ltag,
						name: name,
						lname: name.toLowerCase(),
						kind: kind
					}]);
				}
				return self;
			},
			
			// removes an existing tag
			remove: function (tag) {
				// preparing lookup key
				var ltag = tag.replace(':', '\t').toLowerCase();
				
				// removing tag (key must be escaped)
				if (data.media.countTag(tag) === 1) {
					self.table.remove(self.table.where([{ltag: ltag}], {renumber: true}));
				}
				return self;
			},
			
			// retrieves the first matching tag to a search term
			searchTag: function (term) {
				return (self.table.where([{ltag: term.replace(':', '\t')}], {mode: jOrder.startof, renumber: true})[0] || {tag: ""}).tag.replace('\t', ':');
			},
			
			// retrieves the first matching name (kind is ignored)
			searchName: function (term) {
				return (self.table.where([{lname: term}], {mode: jOrder.startof, renumber: true})[0] || {name: ""}).name;
			}
		};

		return self;
	}();
	
	return data;
}(app.data,
	jOrder,
	app.services);

