////////////////////////////////////////////////////////////////////////////////
// General Dropdown Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $) {
	var
	
	// static event handlers
	onClick;
	
	controls.dropdown = function (caption, popup) {
		var self = controls.control.create(controls.button(caption)),
				base_disabled = self.disabled,
				expanded = false;
		
		//////////////////////////////
		// Initialization

		self.onClick(function (event) {
			if (popup) {
				onClick.call(this, event, popup);
			}
			return false;
		});

		//////////////////////////////
		// Getters / setters

		self.popup = function (value) {
			popup = value;
			return self;
		};

		self.expanded = function (value) {
			if (typeof value !== 'undefined') {
				expanded = value;
				return self;
			} else {
				return expanded;
			}
		};

		//////////////////////////////
		// Control
		
		// expands the dropdown widget
		self.expand = function () {
			// re-rendering UI
			var $this = self
				.expanded(true)
				.render();
			
			// showing popup
			popup
				.anchor($this)
				.build()
				.render($('body'));
				
			// showing hints
			controls.hints
				.hints(self.hints || [])
				.render();
		};
		
		// collapses the dropdown widget
		self.collapse = function () {
			// hiding hints
			controls.hints
				.clear()
				.render();
				
			// hiding dropdown window
			popup
				.render(null);
				
			// re-drawing self (for changing the arrow)
			self
				.expanded(false)
				.render();

			return self;
		};
		
		//////////////////////////////
		// Overrides

		self.disabled = function (value) {
			var before = base_disabled.call(self),
					result = base_disabled.call(self, value),
					after = base_disabled.call(self);
			
			// collapsing widget when just got disabled
			if (after && !before) {
				self.collapse();
			}
			return result;
		};
		
		self.init = function (elem) {
			elem.addClass('w_dropdown');
			if (expanded) {
				elem.addClass('open');
			} else {
				elem.removeClass('open');
			}
		};
		
		self.contents = function () {
			return [
				'<span class="caption">', self.caption(), '</span>',
				'<span class="indicator"></span>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers
	
	onClick = function (event, popup) {
		var $this = $(this).closest('.w_dropdown'),
				self = controls.lookup[$this.attr('id')];
		
		// checking if popup is already up
		if (self.expanded()) {
			self.collapse();
		} else {
			self.expand();
		}
	};
	
	return controls;
}(app.controls || {},
	jQuery);

