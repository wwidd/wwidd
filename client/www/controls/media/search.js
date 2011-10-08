////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services, data) {
	controls.search = function () {
		var self = controls.control.create(),
				filter = "";

		//////////////////////////////
		// Getters, setters

		self.filter = function (value) {
			if (typeof value === 'undefined') {
				return filter;
			} else {
				filter = value;
				return self;
			}
		};
		
		//////////////////////////////
		// Control

		self.reset = function () {
			filter = "";
			self.render();
		};

		//////////////////////////////
		// Event handlers

		function run($this, term) {
			filter = term;
			$this.siblings('.backdrop')
				.val('');
			controls.pager.reset();
			controls.media
				.load();
			controls.url.set();
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
				run($this, term);
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
			if (!filter.length) {
				return false;
			}
			$input.val('');
			run($input, '');
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
				'<span class="icon"></span>',
				'<input type="text" class="focus" value="' + filter + '" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join(' ');
		};
				
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services,
	app.data);

