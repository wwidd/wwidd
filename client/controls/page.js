////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
var controls = (function (controls, $, services, data, control, media) {
	controls.page = function () {
		var self = Object.create(control),
				provider = null,
				entries = [],
				page = 0,
				items = 25;

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
			services.get(function (json) {
				// initializing jOrder table
				provider = data.media(json.data);
				// applying static events
				events();
				// calling handler
				self.appendTo($('#library').empty());
			});
			return self;
		};
		
		// draws contents
		self.getUI = function () {
			var $table = $('<table />'),
					data = provider.getPage(page, items),
					i;
			for (i = 0; i < data.length; i++) {
				entry = media(data[i]);
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
	services,
	data,
	controls.control,
	controls.media);

