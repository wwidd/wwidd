////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = controls.control.create(),
				dirsel;

		//////////////////////////////
		// Child controls
		
		controls.progress.appendTo(self);
				
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
						self
							.disabled({'import': false})
							.render();

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
				controls.progress.html(),
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

