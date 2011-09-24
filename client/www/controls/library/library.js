////////////////////////////////////////////////////////////////////////////////
// Library Control Panel
//
// Encloses controls that have to do with libraries:
// - library switcher
// - root folder adder
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.library = function () {
		var self = controls.control.create(),
				libs = controls.dropdown(),
				busy = false,
				data = {names: []};
		
		controls.libsel.onChange(function (selected) {
			libs
				.caption(selected)
				.collapse()
				.render();
		});
				
		//////////////////////////////
		// Getters, setters
		
		self.busy = function (value) {
			busy = value;
			return self;
		};
		
		//////////////////////////////
		// Overrides

		self.build = function () {
			controls.rootadd
				.appendTo(self);

			libs
				.popup(controls.libsel)
				.appendTo(self);

			return self;
		};
		
		self.init = function (elem) {
			// setting state
			if (busy || self.disabled()) {
				elem.find('button')
					.attr('disabled', 'disabled');
			} else {
				elem.find('button')
					.removeAttr('disabled');
			}
			
			if (busy) {
				elem.find('.spinner')
					.show();
			} else {
				elem.find('.spinner')
					.hide();
			}
		};

		self.html = function () {
			var names = data.names,
					i;
			return [
				'<span class="switcher" id="', self.id, '">',
				'<span>Library:</span>',
				libs.html(),
				controls.rootadd.html(),
				'<span class="spinner"></span>',
				'</span>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

