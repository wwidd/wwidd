////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
var data = function (data, jOrder) {
	data.tags = function () {
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function () {
				var media = data.media.table,
						tags = jOrder.keys(media.index('tags').flat()),
						json = [], i, tag;
						
				for (i = 0; i < tags.length; i++) {
					tag = tags[i];
					json.push({
						tag: tag,
						name: tag.split(':')[0]
					});
				}
				
				self.table = jOrder(json)
						.index('tag', ['tag'], {ordered: true, type: jOrder.string})
						.index('name', ['name'], {ordered: true, grouped: true, type: jOrder.string});
			},

			// retrieves the first matching tag to a search term
			searchTag: function (term) {
				return (self.table.where([{tag: term}], {mode: jOrder.startof, renumber: true})[0] || {tag: ""}).tag;
			},
			
			searchName: function (term) {
				return (self.table.where([{name: term}], {mode: jOrder.startof, renumber: true})[0] || {name: ""}).name;
			}
		};

		return self;
	}();
	
	return data;
}(data,
	jOrder);

