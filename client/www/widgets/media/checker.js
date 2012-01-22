////////////////////////////////////////////////////////////////////////////////
// Select All - Select None widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
	widgets.checker = function () {
		var self = wraith.widget.create(widgets.button()).idle(true),
				state = 'none';	// checked, mixed, none
				
		//////////////////////////////
		// Overrides

		function onClick(event) {
			var $this = $(this),
					checked = $this.is(':checked') && state !== 'mixed';
					
			if (checked) {
				widgets.media.selectAll();
			} else {
				widgets.media.selectNone();
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
			widgets.actions
				.disabled({checker: state === 'none'})
				.render();
		};

		self.contents = function () {
			var $media = $('#' + widgets.media.id + ' .w_medium'),
					count = $media.find(':checked').length;
					
			// determining widget state
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
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith);

