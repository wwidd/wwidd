////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
var controls = (function (controls, $, data) {
	controls.page = function () {
		var self = Object.create(controls.control),
				entries = [],
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
			pager = controls.pager;
			kinds = controls.kinds
				.onChecked(function () {
					self.redraw();
				});
			
			// initializing search box
			controls.search.appendTo($('#search').empty(), self);
				
			// initializing root adder
			controls.rootadd.appendTo($('#rootadd').empty(), self);
			
			// loading data
			self.load();

			return self;
		};

		// (re-)loads page contents
		self.load = function () {
			// initializing media table
			data.media.init(controls.search.filter, function () {
				// initializing tags table
				data.tags.init();
					
				// adding page-level controls
				pager.appendTo($('#pager').empty(), self);
				kinds.appendTo($('#kinds').empty(), self);

				// adding page to dom
				self.appendTo($('#library').empty());
			});
			
			// initializing kinds table
			data.kinds.init(function () {
				if (self.UI) {
					self.redraw();
				}
			});
			
			return self;
		};
		
		// draws contents
		self.getUI = function () {
			var $table = $('<table />', {'class': 'library'}),
					page = data.media.getPage(pager.page, pager.items),
					i;
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

