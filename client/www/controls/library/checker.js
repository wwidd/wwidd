////////////////////////////////////////////////////////////////////////////////
// Select All - Select None control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $) {
	controls.checker = function () {
		var self = controls.control.create();
				
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.find('.all').click(function () {
					controls.library.selectAll();
					return false;
				}).end()
				.find('.none').click(function () {
					controls.library.selectNone();
					return false;
				}).end();
		};

		self.html = function () {
			return [
				'<span id="', self.id, '">',
				'<a href="#" class="all">', "Select All", '</a>',
				'<a href="#" class="none">', "Select None", '</a>',
				'</span>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery);

