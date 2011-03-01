////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
var tagbase = function ($, services, editable) {
	// - data: media data record
	// - handler: callback redrawing parent
	return function (data) {
		var	base = editable(),
				self = Object.create(base),
				i;

		// initializing tag lookup
		self.init = function () {
			var self = this;
			self.lookup = {};
			(function (siblings) {
				for (i = 0; i < siblings.length; i++) {
					self.lookup[siblings[i]] = true;
				}
			}(data.tags.split(',')));
		};
		
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
}(jQuery,
	services,
	editable);

