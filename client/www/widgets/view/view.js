////////////////////////////////////////////////////////////////////////////////
// View Selector Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, model) {
	var
	
	// static event handlers
	onClick;
	
	widgets.view = function () {
		var self = wraith.widget.create(),
				kinds = widgets.dropdown();

		//////////////////////////////
		// Overrides

		self.build = function () {
			kinds
				.caption("Categories")
				.popup(widgets.kinds)
				.appendTo(self);
			
			return self;
		};
		
		self.init = function (elem) {
			elem
				.find('.tile').click(function () {
					// switching to tile view
					if (widgets.media.view() !== 'tile') {
						widgets.media
							.view('tile')
							.render();
						model.cookie.set('view', 'tile');
					}
					return false;
				})
				.end()
				.find('.list').click(function () {
					// switching to list view
					if (widgets.media.view() !== 'list') {
						widgets.media
							.view('list')
							.render();
						model.cookie.set('view', 'list');
					}
					return false;
				})
				.end();
		};

		self.html = function () {
			return [
				'<span id="', self.id, '">',
				'<a href="#" class="tile" title="', "Tile View", '"></a>',
				'<a href="#" class="list" title="', "List View", '"></a>',
				kinds.html(),
				'</span>'
			].join('');
		};
		
		return self;
	}();
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	app.model);

