////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.search = function () {
		var base = controls.control,
				self = Object.create(base),
				timer = null;

		self.filter = "";
				
		// runs search
		function search() {
			self.filter = self.UI.val();
			controls.pager.reset();
			controls.library.init();
		}

		// starts search when enter was pressed
		function onEnter(event) {
			if (event.which !== 13) {
				return;
			}
			search();
		}
		
		self.reset = function () {
			self.filter = "";
			self.redraw();
		};
		
		self.getUI = function () {
			return $('<input type="text" />')
				.addClass('search')
				.keyup(onEnter);
		};
				
		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

