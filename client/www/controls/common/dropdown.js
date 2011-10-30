////////////////////////////////////////////////////////////////////////////////
// General Dropdown Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $) {
	var
	
	// static event handlers
	onClick;
	
	controls.dropdown = function (caption) {
		var self = controls.control.create(controls.button(caption)),
				popup = null;
		
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

		//////////////////////////////
		// Control
		
		self.collapse = function () {
			popup.render(null);
			return self;
		};
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.addClass('w_dropdown');
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
		if ($('#' + popup.id).length) {
			$this.removeClass('open');
			self.collapse();
		} else {
			$this.addClass('open');
			// initializing and displaying popup
			pos = $this.offset();
			height = $this.outerHeight(true);
			popup
				.build()
				.position({
					pageX: pos.left,
					pageY: pos.top + height
				})
				.render($('body'));
		}
	};
	
	return controls;
}(app.controls || {},
	jQuery);

