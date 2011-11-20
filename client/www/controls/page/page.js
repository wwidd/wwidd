////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith, data) {
	widgets.page = function () {
		var self = {},
				pager,
				kinds;

		// initializes page
		self.init = function () {
			// initializing pager widget
			widgets.pager
				.build()
				.render($('#pager').empty());
			
			// adding search box to page
			widgets.search
				.render($('#search')
					.empty()
					.append('&nbsp;'));	// helps vertical alignment
			
			// adding select all
			widgets.checker
				.render($('#checker').empty());
				
			// adding actions
			widgets.actions
				.render($('#checker'));

			// adding select all
			widgets.view
				.build()
				.render($('#views').empty());
				
			// adding library switcher
			widgets.library
				.build()
				.render($('#switcher').empty());
				
			// adding hints container to page
			widgets.hints
				.render($('#footer').empty());
			
			// adding progress indicator to page
			widgets.progress
				.render($('#footer'));
			
			// initializing and adding library to page
			widgets.media
				.load()
				.render($('#media').empty());

			return self;
		};

		return self;
	}();
	
	return widgets;
})(app.widgets || {},
	jQuery,
	wraith,
	app.data);

