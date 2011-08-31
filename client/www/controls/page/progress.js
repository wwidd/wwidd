////////////////////////////////////////////////////////////////////////////////
// General Progress Indicator Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $) {
	controls.progress = function () {
		var self = controls.control.create(),
				progress = 0;

		//////////////////////////////
		// Getters / setters

		// sets the progress bar to a given value
		// - progress: normalized progress value between 0 and 1 (float)
		self.progress = function (value) {
			progress = value;
			return self;
		};
		
		self.reset = function () {
			progress = -1;
			return self;
		};
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			if (progress > 1 || progress < 0) {
				elem.find('.bar')
					.hide();
			} else {
				elem.find('.bar')
					.show()
					.css({width: Math.round(progress * 100) + "%"});
			}
		};

		self.html = function () {
			return [
				'<div id="', self.id, '" class="progress">',
				'<div class="bar"></div>',
				'</div>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery);

