////////////////////////////////////////////////////////////////////////////////
// Editable Control
//
// Controls based on this class have typically two states: one for
// displaying (default) and one for editing its value. The latter becomes
// available when clicking on the display state.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, app */
var app = app || {};

app.controls = function (controls, $) {
	var
	
	// event.type for clicking ('click' or 'touchend')
	click = 'click', 
	
	// static event handler declarations
	onClick,
	onClickOutside;
	
	controls.editable = function () {
		var self = controls.control.create(),
				mode = 'display';

		self.hints = controls.editable.hints;
		
		//////////////////////////////
		// Utility functions
	
		// switches to mode / between modes
		self.toggle = function (value) {
			mode = value || {'display': 'edit', 'edit': 'display'}[mode];
			var elem = this.render(),
					that = this;
			if (value === 'edit') {
				// delegating focus to focus object
				elem.find('.focus')
					.focus();
				
				// displaying hint
				controls.hints
					.hints(this.hints)
					.render();

				// adding removal event
				$('body').one(click, function (event) {
					onClickOutside(event, that, elem);
				});
			} else {
				// unbinding global 'clickoutside' handler(s)
				$('body').unbind(click);

				// hiding hint
				controls.hints
					.clear()
					.render();
			}
			return elem;
		};
		
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
				
		self.html = function () {
			// generating html according to mode
			if (mode === 'edit') {
				return this.edit();
			} else {
				return this.display();
			}
		};
		
		return self;
	};

	//////////////////////////////
	// Static properties

	// hints associated with this control
	controls.editable.hints = [
	];
	
	//////////////////////////////
	// Static event handlers

	// 'click outside' handler
	onClickOutside = function (event, self, elem) {
		if (!elem.find(event.target).length) {
			// handling actual click outside event
			self.toggle('display');
			
			// hiding hint
			controls.hints
				.clear()
				.render();
		} else {
			// re-binding one time handler
			$('body').one(click, function (event) {
				onClickOutside(event, self, elem);
			});
		}
		return false;
	};
	
	onClick = function (event) {
		click = event.type;
		
		// switching display w/ edit
		var self = controls.lookup[$(this).attr('id')],
				elem = self.toggle('edit');
		
		// emulating a 'click outside' event
		$('body').one(click, function (event) {
			onClickOutside(event, self, elem);
		});
		
		return false;
	};

	$('.editable')
		.live('click', onClick)
		.live('touchend', onClick);
	
	return controls;
}(app.controls || {},
	jQuery);
