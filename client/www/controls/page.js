////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
var controls = (function (controls, $, data) {
	controls.page = function () {
		var self = Object.create(controls.control),
				pager,
				kinds;

		// applies static event handlers
		function events() {
			$('#selectall')
				.click(function () {
					controls.library.selectAll();
					return false;
				});

			$('#selectnone')
				.click(function () {
					controls.library.selectNone();
					return false;
				});
		}
		
		// initializes page
		self.init = function () {
			// applying static events
			events();
			
			// initializing pager control
			controls.pager
				.render()
				.appendTo($('#pager').empty());
				
			// initializing and adding kinds control
			controls.kinds
				.onChecked(function () {
					controls.library.redraw();
				})
				.appendTo($('#kinds').empty(), self);
			
			// adding search box to page
			controls.search
				.appendTo($('#search').empty(), self);
			
			// adding library switcher
			controls.switcher
				.render()
				.appendTo($('#switcher').empty());
				
			// adding root adder to page
			controls.rootadd
				.appendTo($('#rootadd').empty(), self);
			
			// initializing and adding library to page
			controls.library
				.onInit(function () {
					// redrawing controls
					controls.pager.render();

					// initializing kinds table
					data.kinds
						.init(function () {
							controls.library.redraw();
							controls.kinds.redraw();
						});
				})
				.init()
				.appendTo($('#media').empty(), self);

			return self;
		};

		// draws contents
		self.getUI = function () {
			var $table = $('<table />', {'class': 'media'}),
					page = data.media.getPage(pager.page, pager.items),
					i, entry;

			for (i = 0; i < page.length; i++) {
				entry = controls.media(page[i]);
				entry.appendTo($table, self);
				entries.push(entry);
			}
			return $table;
		};

		return self;
	}();
	
	return controls;
})(controls || {},
	jQuery,
	data);

