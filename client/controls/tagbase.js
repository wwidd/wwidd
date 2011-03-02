////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	// tag collection
	controls.tags = {
		split: function (names) {
			return names.split(/\s*[^A-Za-z0-9\s]+\s*/);
		}
	};
	
	// - data: media data record
	// - handler: callback redrawing parent
	controls.tagbase = function (data) {
		var	base = controls.editable(),
				self = Object.create(base),
				i;

		// initializing tag lookup
		(function () {
			var siblings = controls.tags.split(data.tags);
			self.lookup = {};
			for (i = 0; i < siblings.length; i++) {
				self.lookup[siblings[i]] = true;
			}
		}());
		
		// re-builds siblings array from lookup
		self.serialize = function () {
			var siblings = [],
					name;
			for (name in this.lookup) {
				siblings.push(name);
			}
			return siblings.join(',');
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

