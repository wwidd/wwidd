////////////////////////////////////////////////////////////////////////////////
// General Selector Popup Control
//
// Selector list part of a dropdown.
// Behavior:
// - There must be a .caption element inside each item.
//	 That will intercept select events.
// - Selected items don't trigger events.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.select = function (options) {
		var	self = controls.control.create(controls.popup('dropdown')),
				selected = 0,		// selected index
				onChange;				// custom event
		
		//////////////////////////////
		// Getters, setters

		self.onChange = function (value) {
			if (typeof value !== 'undefined') {
				onChange = value;
				return self;
			} else {
				return onChange || function () {};
			}
		};
		
		self.selected = function (value) {
			if (typeof value !== 'undefined') {
				selected = value;
				return self;
			} else {
				return selected;
			}
		};
		
		self.options = function (value) {
			if (typeof value !== 'undefined') {
				options = value;
				return self;
			} else {
				return options;
			}
		};

		//////////////////////////////
		// Overrides

		self.item = null;
		
		self.contents = function () {
			var i,
					result = ['<ul class="w_select">'];
					
			if (options) {
				for (i = 0; i < options.length; i++) {
					result.push([
						'<li', i === selected ? ' class="selected"' : '', '>',
						typeof this.item === 'function' ?
							this.item(i, options[i], i === selected) :
							'<span class="caption">' + options[i] + '</span>',
						'</li>'
					].join(''));
				}
			}
			result.push('</ul>');
			return result.join('');
		};

		return self;
	};
	
	//////////////////////////////
	// Static event handlers

	function onSelect(event) {
		var $this = $(this),
				$item = $this.closest('li'),
				i = $item.index(),
				self = controls.lookup[$item.closest('.w_popup').attr('id')];

		return self
			.selected(i)
			.onChange()(i, event);
	}
	
	$('ul.w_select > li:not(.selected) > .caption').live('click', onSelect);
	
	return controls;
}(app.controls || {},
	jQuery);

