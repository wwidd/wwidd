////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
var page = (function ($, services, control, media) {
	return function () {
		var self = Object.create(control);
		
		// extracts filename from path
		function splitPath(path) {
			var bits = path.split('/');

			return {
				file: bits.pop()
			};
		}
		
		// preprocesses metadata returned by service
		function preprocess(data) {
			var i;
			for (i = 0; i < data.length; i++) {
				var row = data[i],
						fileInfo = splitPath(row.path);
				row.file = fileInfo.file;
				row.ext = fileInfo.ext;
			}
		}
		
		// buffers
		self.data = null;
		self.entries = [];
		
		// applies static event handlers
		self.events = function () {
			$('#selectall')
				.click(function () {
					var i;
					for (i = 0; i < self.entries.length; i++) {
						self.entries[i].select();
					}
					return false;
				});

			$('#selectnone')
				.click(function () {
					var i;
					for (i = 0; i < self.entries.length; i++) {
						self.entries[i].deselect();
					}
					return false;
				});
		};
		
		// initializes page
		self.init = function () {
			services.get(function (json) {
				// preprocessing json
				preprocess(json.data);
				self.data = json.data;
				// applying static events
				self.events();
				// calling handler
				self.appendTo($('#library').empty());
			});
			return self;
		};
		
		// draws contents
		self.getUI = function () {
			var $table = $('<table />'),
					data = self.data,
					i;
			for (i = 0; i < data.length; i++) {
				media(data[i]).appendTo($table, self);
			}
			return $table;
		};

		return self;
	};
})(jQuery,
	services,
	control,
	media);

