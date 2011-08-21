////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert */
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = controls.control.create(),
				progress = controls.progress(),
				dirsel;

		//////////////////////////////
		// Child controls
		
		progress.appendTo(self);
				
		//////////////////////////////
		// Utility functions
		
		function enable(elem) {
			elem.removeAttr('disabled');
		}
		
		function disable(elem) {
			elem.attr('disabled', 'disabled');
		}

		//////////////////////////////
		// Events

		// called on clicking the add button
		function onAdd() {
			var $button = $(this),
					$switcher = $('#switcher select');
					
			// disabling 'add folder' button
			// preventing multiple directory selection windows
			disable($button);

			// polls metadata extraction process
			function poll() {
				// polling extraction process
				services.poll('extractor', function (value) {
					// updating progress indicator
					progress
						.progress(value)
						.render();
					// re-enabling disabled controls when polling ends
					if (value === -1) {
						enable($button.add($switcher));
					}
				});
			}
			
			// creating directory selection dialog
			dirsel = controls.dirsel();
			dirsel
				.onCancel(function () {
					// removing dialog on 'cancel'
					dirsel
						.remove()
						.render();
						
					// re-enabling 'add folder' button
					enable($button);
				})
				.onOk(function () {
					// initiating folder import on 'ok' button
					services.addroot(dirsel.selected(), function () {
						// disabling library switcher
						// changing libraries while import is unsafe
						disable($switcher);
				
						// starting poll process
						poll();
						
						// removing dialog
						dirsel
							.remove()
							.render();
						
						// reloading library
						controls.library.load();
					});
				})
				.render($('body'));
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.find('button')
					.click(onAdd);
		};
		
		self.html = function () {
			return [
				'<div id="', self.id, '">',
				'<table>',
				'<tr>',
				'<td class="button">', '<button type="button">', "Add folder to library", '</button>', '</td>',
				'<td class="progress">',
				progress.html(),
				'</td>',
				'</tr>',
				'</table>',
				'</div>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services);

