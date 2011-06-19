////////////////////////////////////////////////////////////////////////////////
// Library Switcher
//
// Lists available libraries and switches between them.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	controls.switcher = function () {
		var base = controls.control(),
				self = Object.create(base),
				data = {names: []};

		self.selected = '';
				
		//////////////////////////////
		// Initialization

		services.getlibs(function (json) {
			data = json.data;
			self.selected = json.data.selected;
			self.render();
		});

		//////////////////////////////
		// Event handlers

		function onChange() {
			var library = $(this).val();
			services.setlib(library, function () {
				self.selected = library;
				controls.pager.reset();
				controls.search.reset();
				controls.library.load();
			});
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.find('select').change(onChange);
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
}(yalp.controls || {},
	jQuery,
	yalp.services);

