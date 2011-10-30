////////////////////////////////////////////////////////////////////////////////
// General Selector Popup Control
//
// Selector list part of a dropdown.
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
				return onChange;
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
						typeof self.item === 'function' ?
							self.item(i, options[i]) :
							options[i],
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
				i = $this.index(),
				self = controls.lookup[$this.closest('.w_popup').attr('id')];

		self
			.selected(i)
			.onChange()(i);
				
		return false;
	}
	
	$('ul.w_select > li').live('click', onSelect);
	
	return controls;
}(app.controls || {},
	jQuery);

