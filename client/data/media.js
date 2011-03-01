////////////////////////////////////////////////////////////////////////////////
// Media Data
////////////////////////////////////////////////////////////////////////////////
var data = function (data, jOrder, services) {
	data.media = function (json) {
		// extracts filename from path
		function splitPath(path) {
			var bits = path.split('/');
			return {
				file: bits.pop()
			};
		}
		
		(function (json) {
			// preprocessing metadata
			var i;
			for (i = 0; i < json.length; i++) {
				var row = json[i],
						fileInfo = splitPath(row.path);
				row.file = fileInfo.file;
				row.ext = fileInfo.ext;
			}
		}(json));
		
		var self = {
			table: jOrder(json)
				.index('mediaid', ['mediaid'], {ordered: true, type: jOrder.number})
				.index('file', ['file'], {ordered: true, grouped: true}),

			getPage: function (page, items) {
				return self.table.orderby(['mediaid'], jOrder.asc, {offset: page * items, limit: items, renumber: true});
			}
		};

		return self;
	};
	
	return data;
}(data || {},
	jOrder);

