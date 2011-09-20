////////////////////////////////////////////////////////////////////////////////
// URL
////////////////////////////////////////////////////////////////////////////////
/*global window */
var app = app || {};

app.controls = (function (controls) {
	function refresh(values) {
		window.location.hash = '#!/' + values.join('/') + '/';
	}
		
	controls.url = {
		get: function () {
			// obtaining URL hash values
			var tmp = window.location.hash.split('/'),
					filter = tmp[1] || "",
					page = parseInt(tmp[2], 10) || 1;
			
			// updating controls' state
			controls.search.filter(filter);
			controls.pager.page(page - 1);
			
			// sanitizing URL
			refresh([filter, page]);
		},
		
		set: function () {
			refresh([controls.search.filter() || '', (parseInt(controls.pager.page(), 10) || 0) + 1]);
		}
	};
	
	// initializing controls according to URL
	controls.url.get();
	
	return controls;
})(app.controls || {});

