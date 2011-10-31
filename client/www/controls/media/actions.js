////////////////////////////////////////////////////////////////////////////////
// Actions Widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $) {
	controls.actions = function () {
		var popup = controls.select(["Delete"]).stateful(false),
				self = controls.control.create(controls.dropdown("Actions", popup));

		// deletes video entries
		function remove() {
			var $media = $('#' + controls.media.id + ' :checked');
			if (window.confirm([
				"You're about to delete", $media.length, ($media.length > 1 ? "entries" : "entry"), "from your library.",
				"This cannot be undone. Proceed?"
			].join(' '))) {
				console.log("Deleting...");
			}
		}
		
		popup.onChange(function (i, item, selected) {
			switch (i) {
			case 0:
				// deleting video entries
				remove();
				break;
			default:
			case 1000:
				break;
			}
		});
			
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery);

