////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert */
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = controls.control.create(),
				dirsel;

		//////////////////////////////
		// Events

		// called on clicking the add button
		function onAdd() {
			var $button = $(this);
			$button.attr('disabled', 'disabled');

			function close() {
				dirsel
					.remove()
					.render();
				$button.removeAttr('disabled');
			}

			dirsel = controls.dirsel();
			dirsel
				.onCancel(close)
				.onOk(function () {
					services.addroot(dirsel.selected(), function () {
						close();
						controls.library.load();
						alert("Folder successfully added to library.");
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
				'<button type="button">', "Add folder to library", '</button>',
				'</div>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services);

