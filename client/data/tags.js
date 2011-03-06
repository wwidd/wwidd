////////////////////////////////////////////////////////////////////////////////
// Tag Collection
////////////////////////////////////////////////////////////////////////////////
var data = function (data) {
	// tag collection
	data.tags = function (names) {
		var separator = /\s*[^A-Za-z0-9:\s]+\s*/,
				tags = names.split(separator);
		
		return {
			// splits string along non-word parts
			split: function () {
				return tags;
			},
			// removes separators from string
			sanitize: function () {
				return tags.join('');
			},
			// tells if any of the tags match the submitted name
			match: function (name) {
				// no match when tags is empty
				if (!tags.length || tags.length === 1 && !tags[0].length) {
					return false;
				}
				var re, i;
				for (i = 0; i < tags.length; i++) {
					re = new RegExp('^' + tags[i] + '.*$', 'i');
					if (name.match(re)) {
						return true;
					}
				}
				return false;
			}
		};
	};
	
	return data;
}(data || {});

