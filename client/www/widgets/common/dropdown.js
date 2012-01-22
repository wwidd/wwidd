////////////////////////////////////////////////////////////////////////////////
// General Dropdown Control
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
	//////////////////////////////
	// Static event handlers
	
	function onClick() {
		var self = wraith.lookup($(this));
		
		// checking if popup is already up
		if (self.expanded()) {
			self.collapse();
		} else {
			self.expand();
		}
		
		return false;
	}
	
	//////////////////////////////
	// Static event bindings
	
	$(document)
		.on('buttonClick', '.w_dropdown', onClick);
	
	//////////////////////////////
	// Class
	
	widgets.dropdown = function (caption, popup) {
		var self = wraith.widget.create(widgets.button(caption)),
				base_disabled = self.disabled,
				expanded = false;
		
		//////////////////////////////
		// Getters / setters

		self.popup = function (value) {
			if (typeof value === 'object') {
				popup = value;
				return self;
			} else {
				return popup;
			}
		};

		self.expanded = function (value) {
			if (typeof value === 'boolean') {
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
			widgets.hints
				.hints(self.hints || [])
				.render();
		};
		
		// collapses the dropdown widget
		self.collapse = function () {
			// hiding hints
			widgets.hints
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
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith);

