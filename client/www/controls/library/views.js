////////////////////////////////////////////////////////////////////////////////
// View Selector Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, data) {
	var
	
	// static event handlers
	onClick;
	
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
				})
				.end()
				.find('.list').click(function () {
					// switching to list view
					if (controls.library.view() !== 'list') {
						controls.library
							.view('list')
							.render();
						data.cookie.set('view', 'list');
					}
					return false;
				})
				.end()
				.find('.kinds')
					.bind('click', onClick)
				.end();
		};

		self.html = function () {
			return [
				'<span id="', self.id, '">',
				'<a href="#" class="tile" title="', "Tile View", '"></a>',
				'<a href="#" class="list" title="', "List View", '"></a>',
				'<button type="button" class="kinds">', "Kinds", '</button>',
				'</span>'
			].join('');
		};
		
		return self;
	}();
	
	//////////////////////////////
	// Static event handlers
	
	onClick = function (event) {
		var $this = $(this),
				pos, height;
		
		// checking if popup is already up
		if ($('body > div.popup.dropdown > div.kinds').length) {
			// removing kinds popup
			controls.kinds
				.remove()
				.render();
		} else {
			// displaying kinds popup
			pos = $this.offset();
			height = $this.outerHeight(true);
			controls.kinds
				.build()
				.position({
					pageX: pos.left,
					pageY: pos.top + height
				})
				.render($('body'));
		}
		return false;
	};
		

	
	return controls;
}(app.controls || {},
	jQuery,
	app.data);

