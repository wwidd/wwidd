////////////////////////////////////////////////////////////////////////////////
// General Selector Popup Widget
//
// Selector list part of a dropdown.
// Behavior:
// - There must be a .caption element inside each item.
//	 That will intercept select events.
// - Selected items don't trigger events.
// - Widget can be stateful or stateless. When stateful, it
//	 preserves information about the selected item.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.select = function (options) {
		var	self = controls.control.create(controls.popup('dropdown')),
				stateful = true,	// whether widget remembers last selected item
				selected = 0,			// selected index
				onChange;					// custom event
		
		//////////////////////////////
		// Getters, setters

		self.stateful = function (value) {
			stateful = value;
			return self;
		};
		
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
						'<li', stateful && i === selected ? ' class="selected"' : '', '>',
						typeof this.item === 'function' ?
							this.item(i, options[i], stateful && i === selected) :
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

