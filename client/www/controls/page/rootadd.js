////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
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
		// Control

		// polls metadata extraction process
		self.poll = function () {
			// disabling add folder button and library switcher
			// changing libraries while import is in progress is unsafe
			self
				.disabled({'import': true})
				.render();
			controls.switcher
				.disabled({'import': true})
				.render();

			// polling extraction process
			services.poll('extractor', function (value) {
				// updating progress indicator
				progress
					.progress(value)
					.render();
					
				// re-enabling disabled controls when polling ends
				if (value === -1) {
					self
						.disabled({'import': false})
						.render();
					controls.switcher
						.disabled({'import': false})
						.render();
				}
			});
		};

		//////////////////////////////
		// Events
			
		// called on clicking the add button
		function onAdd() {
			// disabling 'add folder' button
			// preventing multiple directory selection windows
			self
				.disabled({'import': true})
				.render();

			// creating directory selection dialog
			dirsel = controls.dirsel();
			dirsel
				.onCancel(function () {
					// removing dialog on 'cancel'
					dirsel
						.remove()
						.render();
						
					// re-enabling 'add folder' button
					self
						.disabled({'import': false})
						.render();
				})
				.onOk(function () {
					// initiating folder import on 'ok' button
					services.addroot(dirsel.selected(), function () {
						// starting poll process
						self.poll();
						
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
			// setting state
			if (self.disabled()) {
				elem.find('button')
					.attr('disabled', 'disabled');
			} else {
				elem.find('button')
					.removeAttr('disabled')
					.click(onAdd);
			}
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

