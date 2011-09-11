////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = (function (controls, $, data) {
	controls.page = function () {
		var self = {},
				pager,
				kinds;

		// initializes page
		self.init = function () {
			// initializing pager control
			controls.pager
				.render($('#pager').empty());
			
			// adding search box to page
			controls.search
				.render($('#search')
					.empty()
					.append('&nbsp;'));	// helps vertical alignment
			
			// adding select all
			controls.checker
				.render($('#checker').empty());
				
			// adding select all
			controls.views
				.render($('#views').empty());
				
			// adding library switcher
			controls.switcher
				.render($('#switcher').empty());
				
			// adding hints container to page
			controls.hints
				.render($('#hints').empty());
			
			// adding root adder to page
			controls.rootadd
				.render($('#rootadd').empty());
			
			// initializing and adding library to page
			controls.library
				.load()
				.render($('#media').empty());

			return self;
		};

		return self;
	}();
	
	return controls;
})(app.controls || {},
	jQuery,
	app.data);

