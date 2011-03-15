////////////////////////////////////////////////////////////////////////////////
// Library Switcher
//
// Lists available libraries and switches between them.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.switcher = function () {
		var base = controls.base(),
				self = Object.create(base),
				data = {names: []};

		// loading data
		services.getlibs(function (json) {
			data = json.data;
			self.render();
		});

		// dropdown item selection handler
		function onChange() {
			services.setlib($(this).val(), function () {
				controls.pager.reset();
				controls.search.reset();
				controls.library.init();
			});
		}

		// selector identifying control type
		self.selector = '.switcher';
		
		// initializes switcher control
		self.init = function (elem, selector) {
			elem.find('select').change(onChange);
			return false;
		};

		// generates control markup
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
					'<option value="', names[i], '" selected="', names[i] === selected ? 'selected' : '', '">',
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

