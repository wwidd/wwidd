////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	// - data: media data record
	// - handler: callback redrawing parent
	controls.tagbase = function (data) {
		var	base = controls.editable(),
				self = Object.create(base),
				i;

		// initializing tag lookup
		(function () {
			var siblings = data.tags.split(',');
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

