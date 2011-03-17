////////////////////////////////////////////////////////////////////////////////
// Library Switcher
//
// Lists available libraries and switches between them.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.switcher = function () {
		var base = controls.control(),
				self = Object.create(base),
				data = {names: []};

		//////////////////////////////
		// Initialization

		services.getlibs(function (json) {
			data = json.data;
			self.render();
		});

		//////////////////////////////
		// Event handlers

		function onChange() {
			services.setlib($(this).val(), function () {
				controls.pager.reset();
				controls.search.reset();
				controls.library.load();
			});
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem, selector) {
			elem.find('select').change(onChange);
			return false;
		};

		self.html = function () {
			var names = data.names,
					selected = data.selected,
					i,
			result = [
				'<span class="switcher" id="', self.id, '">',
				'<span>Library:</span>',
				'<select>'
			];
			for (i = 0; i < names.length; i++) {
				result.push([
					'<option value="', names[i], '"', names[i] === selected ? ' selected="selected"' : '', '">',
					names[i],
					'</option>'
				].join(''));
			}
			result.push([
				'</select>',
				'</span>'
			].join(''));
			return result.join('');
		};
		
		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

