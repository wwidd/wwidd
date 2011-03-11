////////////////////////////////////////////////////////////////////////////////
// Library Switcher
//
// Lists available libraries and switches between them.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.switcher = function () {
		var base = controls.control,
				self = Object.create(base),
				data = {names: []};

		function onChange() {
			services.setlib($(this).val(), function () {
				controls.pager.reset();
				controls.search.reset();
				controls.library.init();
			});
		}
				
		// initializes switcher control
		self.init = function () {
			services.getlibs(function (json) {
				data = json.data;
				self.redraw();
			});
			return self;
		};
				
		self.getUI = function () {
			var $result = $('<span />')
						.append($('<span />').text("Library:")),
					$select = $('<select />')
						.change(onChange),
					names = data.names,
					selected = data.selected,
					i;

			for (i = 0; i < names.length; i++) {
				$select
					.append($('<option />', {'value': names[i], 'selected': names[i] === selected ? 'selected' : null})
						.text(names[i]));
			}
					
			return $result.append($select);
		};

		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

