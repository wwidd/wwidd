////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
var data = function (data, jOrder, services) {
	data.tags = function () {
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function () {
				services.gettags(function (json) {
					self.table = jOrder(json.data)
						.index('tag', ['tag'], {ordered: true, type: jOrder.string})
						.index('name', ['name'], {ordered: true, grouped: true, type: jOrder.string});
				});
				return self;
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
	jOrder,
	services);

