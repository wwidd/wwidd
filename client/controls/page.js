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
					var i;
					for (i = 0; i < entries.length; i++) {
						entries[i].select();
					}
					return false;
				});

			$('#selectnone')
				.click(function () {
					var i;
					for (i = 0; i < entries.length; i++) {
						entries[i].deselect();
					}
					return false;
				});
		}
		
		// initializes page
		self.init = function () {
			// applying static events
			events();
			
			// initializing pager control
			controls.pager
				.appendTo($('#pager').empty(), self);
				
			// initializing and adding kinds control
			controls.kinds
				.onChecked(function () {
					controls.library.redraw();
				})
				.appendTo($('#kinds').empty(), self);
			
			// adding search box to page
			controls.search
				.appendTo($('#search').empty(), self);
				
			// adding root adder to page
			controls.rootadd
				.appendTo($('#rootadd').empty(), self);
			
			// adding library to page
			controls.library
				.appendTo($('#media').empty(), self);
			
			// loading data
			controls.library
				.onInit(function () {
					// redrawing controls
					controls.pager.redraw();

					// initializing kinds table
					data.kinds
						.init(function () {
							controls.library.redraw();
							controls.kinds.redraw();
						});
				})
				.init();

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

