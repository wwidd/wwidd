////////////////////////////////////////////////////////////////////////////////
// URL
//
// Gets or sets browser URL according to search terms
////////////////////////////////////////////////////////////////////////////////
/*global window */
var app = app || {};

app.controls = (function (controls) {
	// sets ajax URL in browser
	function refresh(values) {
		window.location.hash = '#!/' + values.join('/') + '/';
	}
	
	controls.url = {
		get: function () {
			// obtaining URL hash values
			var tmp = decodeURI(window.location.hash).split('/'),
					library = '',		// placeholder for library name
					filter = tmp[2] || '',
					page = parseInt(tmp[3], 10) || 1;
			
			// updating controls' state
			controls.search.filter(filter);
			controls.pager.page(page - 1);
			
			// sanitizing URL
			refresh([library, filter, page]);
		},
		
		set: function () {
			refresh(['', controls.search.filter() || '', (parseInt(controls.pager.page(), 10) || 0) + 1]);
		}
	};
	
	// initializing controls according to URL
	controls.url.get();
	
	return controls;
})(app.controls || {});

