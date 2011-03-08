////////////////////////////////////////////////////////////////////////////////
// Tag Adder Control
//
// Adds tags to a video
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	// - row: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	controls.tagadd = function (row) {
		var	base = controls.tagbase(row),
				self = Object.create(base);

		// tag addition handler: do nothing
		function onAdd(event) {
			event.preventDefault();
		}

		// tag change event handler
		function onChange(event) {
			var $this = $(this);
			
			// filling backdrop
			$this.siblings('.backdrop').val($this.val());
			
			// enter
			if (event.which !== 13) {
				return;
			}
			var name = $(this).val(),
					filter = controls.search.filter;
			if (!name.length) {
				return;
			}
			if (event.shiftKey) {
				// shift + enter is not defined for addition
			} else if (event.ctrlKey) {
				// adding tag(s) to multiple media
				if (filter.length && confirm("Add this to SEARCH results?")) {
					services.addtag(null, name, filter, controls.page.load);
				}
			} else {
				// adding tag(s) to simgle media file
				services.addtag(row.mediaid, name, null, function () {
					self.changetag(null, name, row);
				});
			}
		}

		self.display = function () {
			return base.display(self, $('<span />', {'class': 'tag display add'})
				// adding removal button
				.append($('<a />', {'href': '#'})
					.text('+')
					.click(onAdd)));
		};

		self.edit = function () {
			return $('<span />', {'class': 'tag edit add'})
				.append($('<input />', {'type': 'text', 'class': 'focus'})
					.keyup(onChange))
				.append($('<input />', {'type': 'text', 'class': 'backdrop'}));
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

