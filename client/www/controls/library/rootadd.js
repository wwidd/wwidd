////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = controls.control.create(controls.button("+")),
				dirsel;

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
					dirsel.render(null);
						
					// re-enabling 'add folder' button
					self
						.disabled({'import': false})
						.render();
				})
				.onOk(function () {
					// initiating folder import on 'ok' button
					services.root.add(dirsel.selected(), function () {
						self
							.disabled({'import': false})
							.render();

						// removing dialog
						dirsel
							.remove()
							.render();
						
						// reloading library
						controls.media.load();
					});
				})
				.render($('body'));
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			// setting state
			if (self.disabled()) {
				self.onClick(null);
			} else {
				self.onClick(onAdd);
			}
		};

		self.contents = function () {
			return [
				'<span class="caption" title="', "Add folder to library", '">', self.caption(), '</span>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

