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

		progress.appendTo(self);
				
		//////////////////////////////
		// Events

		// called on clicking the add button
		function onAdd() {
			var $button = $(this);
			$button.attr('disabled', 'disabled');

			function poll() {
				services.poll('extractor', function (value) {
					progress
						.progress(value)
						.render();
					if (value === -1) {
						$button.removeAttr('disabled');
					}
				});
			}
			
			dirsel = controls.dirsel();
			dirsel
				.onCancel(function () {
					dirsel
						.remove()
						.render();
					$button.removeAttr('disabled');
				})
				.onOk(function () {
					services.addroot(dirsel.selected(), function () {
						poll();
						dirsel
							.remove()
							.render();
						controls.library.load();
						alert("Folder successfully added to library.\nNow importing metadata in background.");
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

