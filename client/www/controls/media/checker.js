////////////////////////////////////////////////////////////////////////////////
// Select All - Select None control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $) {
	controls.checker = function () {
		var self = controls.control.create(controls.button()),
				state = 'none';	// checked, mixed, none
				
		//////////////////////////////
		// Overrides

		function onClick(event) {
			var $this = $(this),
					checked = $this.is(':checked') && state !== 'mixed';
					
			if (checked) {
				controls.media.selectAll();
			} else {
				controls.media.selectNone();
			}
			
			self.render();
		}
		
		self.init = function (elem) {
			// positions checkbox in the middle of its parent vertically
			function adjustMargin() {
				return (elem.height() - $(this).outerHeight(false)) / 2;
			}
			
			elem
				.addClass('w_checker')
				.find('input')
					.css('margin-top', adjustMargin)
					.click(onClick)
				.end();
			
			// controlling actions dropdown state
			controls.actions
				.disabled({checker: state === 'none'})
				.render();
		};

		self.contents = function () {
			var $media = $('#' + controls.media.id + ' .medium'),
					count = $media.find(':checked').length;
					
			// determining control state
			if (count === $media.length && count > 0) {
				state = 'checked';
			} else if (count === 0) {
				state = 'none';
			} else {
				state = 'mixed';
			}
			
			return [
				'<input type="checkbox" ', state !== 'none' ? 'checked="checked"' : '', ' class="', state, '"/>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery);

