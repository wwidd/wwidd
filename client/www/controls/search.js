////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.search = function () {
		var self = Object.create(controls.base());

		self.filter = "";
		
		self.reset = function () {
			self.filter = "";
			self.render();
		};

		//////////////////////////////
		// Event handlers

		function onEnter(event) {
			if (event.which !== 13) {
				return;
			}
			self.filter = $(this).val();
			controls.pager.reset();
			controls.library.load();
		}
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.keyup(onEnter);
			return false;
		};
		
		self.html = function () {
			return '<input id="' + self.id + '" type="text" class="search" />';
		};
				
		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

