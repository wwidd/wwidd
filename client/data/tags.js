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
						json = [], i;
						
				for (i = 0; i < tags.length; i++) {
					json.push({tag: tags[i]});
				}
				
				self.table = jOrder(json)
						.index('tag', ['tag'], {ordered: true, type: jOrder.string});
			},

			// retrieves the first matching tag to a search term
			search: function (term) {
				return (self.table.where([{tag: term}], {mode: jOrder.startof, renumber: true})[0] || {tag: ""}).tag;
			}
		};

		return self;
	}();
	
	return data;
}(data,
	jOrder);

