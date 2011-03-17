////////////////////////////////////////////////////////////////////////////////
// Video Library
////////////////////////////////////////////////////////////////////////////////
var controls = (function (controls, $, data) {
	controls.library = function () {
		var self = Object.create(controls.control()),
				onInit = function () {};
		
		//////////////////////////////
		// Business methods

		// selects all elements in visible library
		self.selectAll = function () {
			self.UI.find('td.check > :checkbox').attr('checked', 'checked');
		};
		
		// deselects all elements in visible library
		self.selectNone = function () {
			self.UI.find('td.check > :checkbox').removeAttr('checked', 'checked');
		};
				
		// (re-)loads library contents
		self.load = function () {
			// initializing media table
			data.media.init(controls.search.filter, function () {
				// initializing tags table
				data.tags.init();	
				// external event handler
				onInit();
			});
			return self;
		};
		
		//////////////////////////////
		// Event handlers

		self.onInit = function (handler) {
			onInit = handler;
			return self;
		};
				
		//////////////////////////////
		// Overrides

		self.html = function () {
			var result = ['<table id="', self.id, '" class="media">'],
					page = data.media.getPage(controls.pager.page, controls.pager.items),
					i, entry;

			for (i = 0; i < page.length; i++) {
				result.push(
					controls.media(page[i])
						.appendTo(self)
						.html());
			}
			result.push('</table>');
			
			return result.join('');
		};

		return self;
	}();
	
	return controls;
})(controls || {},
	jQuery,
	data);

