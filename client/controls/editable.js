////////////////////////////////////////////////////////////////////////////////
// Editable Control
//
// Controls based on this class have typically two states: one for
// displaying (default) and one for editing its value. The latter becomes
// available when clicking on the display state.
////////////////////////////////////////////////////////////////////////////////
var editable = function ($, control) {
	return function () {
		var self = Object.create(control);
		
		// mode can be either 'display' or 'edit'
		self.mode = 'display';
		
		// switches to mode / between modes
		self.toggle = function (mode) {
			this.mode = mode || {'display': 'edit', 'edit': 'display'}[this.mode];
			this.redraw();
			if (mode === 'edit') {
				this.UI.focus();
			}
		};
		
		// constructs display representation
		self.display = function (self, $elem) {
			return $elem
				// dropdown appears on mouse click
				.click(function () {
					// switching display w/ edit
					self.toggle('edit');

					// 'click outside' handler
					function handler(event) {
						if (event.target !== self.UI[0]) {
							// handling actual click outside event
							self.toggle('display');
						} else {
							// re-binding one time handler
							$('body').one('click', handler);
						}
						return false;
					}
					
					// emulating a 'click outside' event
					$('body').one('click', handler);

					return false;
				});
		};
		
		// constructs editable representation
		self.edit = function () {
			throw "Abstract";
		};
		
		// constructs jQuery representation of control
		self.getUI = function () {
			if (this.mode === 'edit') {
				return this.edit();
			} else {
				return this.display();
			}
		};
		
		return self;
	};
}(jQuery,
	control);
