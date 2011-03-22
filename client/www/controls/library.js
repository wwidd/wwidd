////////////////////////////////////////////////////////////////////////////////
// Video Library
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.controls = (function (controls, $, data) {
	controls.library = function () {
		var self = Object.create(controls.control()),
				onInit = function () {};
		
		//////////////////////////////
		// Business methods

		// selects all elements in visible library
		self.selectAll = function () {
			$('#' + self.id + ' td.check > :checkbox').attr('checked', 'checked');
		};
		
		// deselects all elements in visible library
		self.selectNone = function () {
			$('#' + self.id + ' td.check > :checkbox').removeAttr('checked', 'checked');
		};
		
		// (re-)loads library contents
		self.load = function () {
			data.media.init(controls.search.filter, function () {
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

		function build() {
			var page = data.media.getPage(controls.pager.page, controls.pager.items),
					i;
			self.clear();
			for (i = 0; i < page.length; i++) {
				controls.media(page[i]).appendTo(self);
			}
		}

		self.html = function () {
			build();
			
			var result = ['<table id="', self.id, '" class="media">'],
					i;
			for (i = 0; i < self.children.length; i++) {
				result.push(self.children[i].html());
			}
			result.push('</table>');
			return result.join('');
		};

		return self;
	}();
	
	return controls;
})(yalp.controls || {},
	jQuery,
	yalp.data);

