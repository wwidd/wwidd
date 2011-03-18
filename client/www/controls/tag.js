////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	// gets key from a lookup table
	function keys(lookup) {
		var result = [],
				name;
		for (name in lookup) {
			result.push(name);
		}
		return result;
	}
	
	// - row: media data record
	// - handler: callback redrawing parent
	controls.tag = function (row) {
		var	self = Object.create(controls.editable()),
				siblings = row.tags,
				i;

		// initializing tag lookup
		self.lookup = {};
		for (i = 0; i < siblings.length; i++) {
			self.lookup[siblings[i]] = true;
		}
		
		// changes tag to one or more tags
		// - before: value before change, either a string or null (insertion)
		// - after: value after change, comma separated string or null (deletion)
		self.changetag = function (before, after, row) {
			var self = this,
					names, i;

			// deleting old tag if there was one
			if (before) {
				delete self.lookup[before];
			}
			
			// adding new value(s) to buffer
			if (after) {
				names = data.tag(after).split();
				for (i = 0; i < names.length; i++) {
					self.lookup[names[i]] = true;
				}
			}
			
			// finalizing changes
			row.tags = keys(this.lookup);
			
			// redrawing tags for media entry
			self.parent.render();
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

