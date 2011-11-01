////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = controls.control.create(controls.button()),
				dirsel;

		//////////////////////////////
		// Events
		
		function collapse() {
			// removing dialog
			dirsel
				.remove()
				.render();
			
			// re-enabling button
			self
				.disabled({'import': false})
				.render();
		}
		
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
				.onCancel(collapse)
				.onOk(function () {
					// initiating folder import on 'ok' button
					services.root.add(dirsel.selected(), function () {
						// collapsing folder selection window
						collapse();
						
						// reloading library
						controls.media.load();
					});
				})
				.render($('body'));
		}

		//////////////////////////////
		// Initialization

		self.onClick(onAdd);
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.addClass('w_rootadd');
		};

		self.contents = function () {
			return [
				'<span class="caption" title="', "Add folder to library", '">',	'</span>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

