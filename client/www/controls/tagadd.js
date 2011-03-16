////////////////////////////////////////////////////////////////////////////////
// Tag Adder Control
//
// Adds tags to a video
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	// - row: media data record
	controls.tagadd = function (row) {
		var	base = controls.tagbase(row),
				self = Object.create(base);

		//////////////////////////////
		// Event handlers
		
		// tag addition handler: do nothing
		function onAdd(event) {
			self.parent.add();
			return false;
		}

		// tag change event handler
		function onChange(event) {
			var $this = $(this),
					term = $this.val(),
					match = term.length ? data.tags.searchTag(term) : "",
					name = match.length ? match : term,
					filter = controls.search.filter;
			
			switch (event.which) {
			case 13:
				// enter - saving values
				name = data.tag(name).sanitize();
				if (!name.length) {
					return;
				}
				if (event.shiftKey) {
					// shift + enter is not defined for addition
				} else if (event.ctrlKey) {
					// adding tag(s) to multiple media
					if (filter.length && confirm("Add this to SEARCH results?")) {
						services.addtag(null, name, filter, controls.library.init);
					}
				} else {
					// adding tag(s) to simgle media file
					services.addtag(row.mediaid, name, null, function () {
						self.changetag(null, name, row);
						self.parent.add();
					});
				}
				break;
			case 27:
				// escape - cancel
				self.toggle('display');
				break;
			default:
				// any other key - filling backdrop
				$this.siblings('.backdrop')
					.val(name);
				break;
			}
		}

		//////////////////////////////
		// Overrides
		
		self.init = function (elem) {
			if (self.mode === 'display') {
				elem.find('a').click(onAdd);
			} else {
				elem.find('input.focus').keyup(onChange);
			}
			base.init(self, elem);
		};
		
		self.display = function () {
			return [
				'<span id="', self.id, '" class="tag display add">',
				'<a href="#">', "+", '</a>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag edit add">',
				'<input type="text" class="focus" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

