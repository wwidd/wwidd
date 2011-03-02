////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
var controls = (function (controls, $, data) {
	controls.page = function () {
		var self = Object.create(controls.control),
				provider = null,
				entries = [],
				pager;

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
			pager = controls.pager(function () {
				self.redraw();
			});
			self.load();
			return self;
		};

		// (re-)loads page contents
		self.load = function () {
			// initializing jOrder table
			(provider = data.media()).init(function () {
				// adding pager control
				pager.provider = provider;
				pager.appendTo($('#pager').empty());

				// adding page to dom
				self.appendTo($('#library').empty());
			});
			return self;
		};
		
		// draws contents
		self.getUI = function () {
			var $table = $('<table />'),
					data = provider.getPage(pager.page, pager.items),
					i;
			for (i = 0; i < data.length; i++) {
				entry = controls.media(data[i]);
				entry.appendTo($table, self);
				entries.push(entry);
			}
			return $table;
		};

		return self;
	};
	
	return controls;
})(controls || {},
	jQuery,
	data);

