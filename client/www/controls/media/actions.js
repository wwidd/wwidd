////////////////////////////////////////////////////////////////////////////////
// Actions Widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, window */
var app = app || {};

app.controls = function (controls, $, jOrder, data, services) {
	controls.actions = function () {
		var popup = controls.select(["Refresh thumbnail", "Delete"]).stateful(false),
				self = controls.control.create(controls.dropdown("Actions", popup));

		// deletes video entries
		function remove(mediaids) {
			if (window.confirm([
				"You're about to delete", mediaids.length, (mediaids.length > 1 ? "entries" : "entry"), "from your library.",
				"This cannot be undone. Proceed?"
			].join(' '))) {
				// calling deletion service
				// then reloading entire library
				services.media.del(mediaids.join(','), function () {
					data.media.unset(mediaids);
					controls.media.refresh();
				});
			}
		}
		
		// extracts thumbnails and keywords for media entries
		function extract(mediaids) {
			services.media.extract(mediaids.join(','), true, function () {
				controls.media.poll();
			});
		}
		
		popup.onChange(function (i, item, selected) {
			// obtaining selected media ids
			var mediaids = jOrder.keys(controls.media.selected);
			
			action:
			switch (i) {
			case 0:
				// extracting from video entries
				extract(mediaids);
				break action;
			case 1:
				// deleting video entries
				remove(mediaids);
				break action;
			default:
			case 1000:
				break action;
			}
		});
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	jOrder,
	app.data,
	app.services);

