////////////////////////////////////////////////////////////////////////////////
// View Selector Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, data) {
	controls.views = function () {
		var self = controls.control.create();
				
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.find('.tile').click(function () {
					// switching to tile view
					if (controls.library.view() !== 'tile') {
						controls.library
							.view('tile')
							.render();
						data.cookie.set('view', 'tile');
					}
					return false;
				}).end()
				.find('.list').click(function () {
					// switching to list view
					if (controls.library.view() !== 'list') {
						controls.library
							.view('list')
							.render();
						data.cookie.set('view', 'list');
					}
					return false;
				}).end();
		};

		self.html = function () {
			return [
				'<span id="', self.id, '">',
				'<a href="#" class="tile" title="', "Tile View", '"></a>',
				'<a href="#" class="list" title="', "List View", '"></a>',
				'</span>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.data);

