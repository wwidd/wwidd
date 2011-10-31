////////////////////////////////////////////////////////////////////////////////
// Actions Widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, window */
var app = app || {};

app.controls = function (controls, $, jOrder, services) {
	controls.actions = function () {
		var popup = controls.select(["Delete"]).stateful(false),
				self = controls.control.create(controls.dropdown("Actions", popup));

		// deletes video entries
		function remove() {
			// obtaining selected media ids
			var mediaids = jOrder.keys(controls.media.selected);
			
			if (window.confirm([
				"You're about to delete", mediaids.length, (mediaids.length > 1 ? "entries" : "entry"), "from your library.",
				"This cannot be undone. Proceed?"
			].join(' '))) {
				// calling deletion service
				// then reloading entire library
				services.media.del(mediaids.join(','), controls.media.load);
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
	jQuery,
	jOrder,
	app.services);

