////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.search = function () {
		var self = Object.create(controls.control());

		self.filter = "";
		
		self.reset = function () {
			self.filter = "";
			self.render();
		};

		//////////////////////////////
		// Event handlers

		function onChange(event) {
			var $this = $(this),
					term = $this.val(),
					match, name;
			if (event.which !== 13) {
				match = !term.length ? "" : [
					term,
					data.tags.searchName(term.toLowerCase()).substr(term.length)
				].join('');
				$this.siblings('.backdrop')
					.val(match)
					.scrollLeft($this.scrollLeft());
			} else {
				self.filter = term;
				controls.pager.reset();
				controls.library.load();
			}
		}
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.children('.focus').keyup(onChange);
			return false;
		};
		
		self.html = function () {
			return [
				'<span id="' + self.id + '" class="search">',
				'<input type="text" class="focus" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join(' ');
		};
				
		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

