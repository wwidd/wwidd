////////////////////////////////////////////////////////////////////////////////
// Video Library
////////////////////////////////////////////////////////////////////////////////
var controls = (function (controls, $, data) {
	controls.library = function () {
		var self = Object.create(controls.control),
				entries = [],
				onInit = function () {};
		
		// selects all elements in visible library
		self.selectAll = function () {
			self.UI.find('td.check > :checkbox').attr('checked', 'checked');
		};
		
		// deselects all elements in visible library
		self.selectNone = function () {
			self.UI.find('td.check > :checkbox').removeAttr('checked', 'checked');
		};
				
		// setter for external init handler
		self.onInit = function (handler) {
			onInit = handler;
			return self;
		};
				
		// (re-)loads library contents
		self.init = function () {
			// initializing media table
			data.media.init(controls.search.filter, function () {
				// initializing tags table
				data.tags.init();	
				// external event handler
				onInit();
			});
			return self;
		};
		
		// draws contents
		self.getUI = function () {
			var $table = $('<table />', {'class': 'media'}),
					page = data.media.getPage(controls.pager.page, controls.pager.items),
					i, entry;

			for (i = 0; i < page.length; i++) {
				entry = controls.media(page[i]);
				entry.parent = self;
				entry.render($table);
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

