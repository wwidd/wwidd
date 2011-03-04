////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	// tag collection
	controls.tags = function (names) {
		var separator = /\s*[^A-Za-z0-9:\s]+\s*/;
		
		return {
			// splits string along non-word parts
			split: function () {
				return names.split(separator);
			},
			// removes separators from string
			sanitize: function () {
				return names.replace(separator, '');
			}
		};
	};
	
	// - row: media data record
	// - handler: callback redrawing parent
	controls.tagbase = function (row) {
		var	base = controls.editable(),
				self = Object.create(base),
				i;

		// initializing tag lookup
		(function () {
			var siblings = row.tags;
			self.lookup = {};
			for (i = 0; i < siblings.length; i++) {
				self.lookup[siblings[i]] = true;
			}
		}());
		
		// gets key from a lookup table
		function keys(lookup) {
			var result = [],
					name;
			for (name in lookup) {
				result.push(name);
			}
			return result;
		}
		
		// changes tag to one or more tags
		// - before: value before change, either a string or null (insertion)
		// - after: value after change, comma separated string or null (deletion)
		self.changetag = function (before, after, row) {
			// deleting old tag if there was one
			if (before) {
				delete this.lookup[before];
			}
			// adding new value(s) to buffer
			var names, i;
			if (after) {
				names = controls.tags(after).split();
				for (i = 0; i < names.length; i++) {
					this.lookup[names[i]] = true;
				}
			}
			// finalizing changes
			row.tags = keys(this.lookup);
			this.parent.redraw();
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

