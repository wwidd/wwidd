////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services, data) {
	controls.search = function () {
		var self = Object.create(controls.control());

		self.filter = "";
		
		self.reset = function () {
			self.filter = "";
			self.render();
		};

		//////////////////////////////
		// Event handlers

		function filter($this, term) {
			self.filter = term;
			$this.siblings('.backdrop')
				.val('');
			controls.pager.reset();
			controls.library
				.reset()
				.load();
		}

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
				filter($this, term);
			}
		}
		
		function onControl(event) {
			// making input field lose focus on hitting Esc
			if (event.which === 27) {
				$(this).blur();
			}
		}
		
		function onClear() {
			var $input = $(this).siblings('.focus');
			if (!self.filter.length) {
				return false;
			}
			$input.val('');
			filter($input, '');
			return false;
		}
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.children('.focus')
					.keyup(onChange)
					.keydown(onControl)
				.end()
				.children('.clear').click(onClear).end();
			return false;
		};
		
		self.html = function () {
			return [
				'<span id="' + self.id + '" class="search">',
				'<a class="clear" href="#"></a>',
				'<input type="text" class="focus" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join(' ');
		};
				
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services,
	yalp.data);

