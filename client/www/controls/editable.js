////////////////////////////////////////////////////////////////////////////////
// Editable Control
//
// Controls based on this class have typically two states: one for
// displaying (default) and one for editing its value. The latter becomes
// available when clicking on the display state.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $) {
	controls.editable = function () {
		var self = Object.create(controls.control());
		
		// mode can be either 'display' or 'edit'
		self.mode = 'display';
		
		//////////////////////////////
		// Utility functions

		// switches to mode / between modes
		self.toggle = function (mode) {
			this.mode = mode || {'display': 'edit', 'edit': 'display'}[this.mode];
			var elem = this.render();
			if (mode === 'edit') {
				elem.find('.focus').focus();
			}
			return elem;
		};
		
		//////////////////////////////
		// Event handlers

		function onClick(self, event) {
			// switching display w/ edit
			var elem = self.toggle('edit');
			
			// 'click outside' handler
			function handler(event) {
				if (event.target !== (elem.find('input,select')[0] || elem[0])) {
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
		}
		
		//////////////////////////////
		// Overrides
		
		// constructs display representation
		self.display = function () {
			throw "Abstract";
		};
		
		// constructs editable representation
		self.edit = function () {
			throw "Abstract";
		};
		
		self.init = function (self, elem) {
			if (self.mode !== 'edit') {
				elem.click(function (event) {
					return onClick(self, event);
				});
			}			
		};
		
		self.html = function () {
			if (this.mode === 'edit') {
				return this.edit();
			} else {
				return this.display();
			}
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery);
