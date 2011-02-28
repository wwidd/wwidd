////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
var page = (function ($, services, control, media) {
	return function () {
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
		
		var self = Object.create(control);
		
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
		self.init = function (handler) {
			services.get(function (json) {
				// preprocessing json
				preprocess(json.data);
				self.data = json.data;
				// applying static events
				self.events();
				// calling handler
				if (handler) {
					handler();
				}
			});
			return self;
		};
		
		// draws contents
		self.getUI = function () {
			return $('<table />')
				.append($(function () {
					var rows = [],
							data = self.data,
							i, entry;
					for (i = 0; i < data.length; i++) {
						entry = media(data[i]);
						self.entries.push(entry);
						rows.push(entry.getUI()[0]);
					}
					return rows;
				}()));
		};
		
		// appends contents to dom 
		self.appendTo = function ($parent) {
			self.getUI()
				.appendTo($parent
						.empty());
		};

		return self;
	};
})(jQuery,
	services,
	control,
	media);

