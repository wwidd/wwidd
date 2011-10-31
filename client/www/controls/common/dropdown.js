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
		
		self.collapse = function () {
			expanded = false;
			popup.render(null);
			self.render();
			return self;
		};
		
		//////////////////////////////
		// Overrides

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
				self = controls.lookup[$this.attr('id')],
				pos, height;
		
		// checking if popup is already up
		if (self.expanded()) {
			// hiding popup
			self
				.expanded(false)
				.collapse();
		} else {
			// initializing and displaying popup
			pos = $this.offset();
			height = $this.outerHeight(true);
			
			// re-rendering UI
			$this = self
				.expanded(true)
				.render();
			
			// showing popup
			popup
				.anchor($this)
				.build()
				.render($('body'));
		}
	};
	
	return controls;
}(app.controls || {},
	jQuery);

