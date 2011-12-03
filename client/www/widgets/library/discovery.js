////////////////////////////////////////////////////////////////////////////////
// Discovery Widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, flock */
var app = app || {};

app.widgets = function (widgets, $, wraith, model, cache) {
	function onSelect($node, node) {
	}
	
	function onDisplay(path) {
		var depth = path.length,
				text = path[depth - 1],
				data;
				
		switch (depth) {
		case 0:
			return "full library";
		case 1:
			return {
				'rating': "by rating",
				'kind': "by category"
			}[text] || false;
		case 2:
			switch (path[0]) {
			case 'rating':
				return {
					'1': "*",
					'2': "**",
					'3': "***",
					'4': "****",
					'5': "*****"
				}[text] || "unrated";
			case 'kind':
				return text || "uncategorized";
			}
			break;
		default:
			// where to cut tree
			if (depth > 2 && path[0] === 'rating' ||
				depth > 3 && path[0] === 'kind') {
				return false;
			}
		}

		// assessing count
		data = cache.get(path);
		if (typeof data.count === 'number') {
			return text + ' (' + data.count + ')';
		}
	}
	
	widgets.discovery = function () {
		var self = wraith.widget.create(),
				tree = widgets.tree()
					.onSelect(onSelect)
					.onDisplay(onDisplay)
					.simple(true);
			
		//////////////////////////////
		// Overrides

		self.build = function () {
			tree
				.json(cache.root())
				.appendTo(self);

			return self;
		};
		
		self.html = function () {
			return [
				'<div id=', self.id, ' class="w_discovery">',
				tree.html(),
				'</div>'
			].join('');
		};
		
		return self;
	}();
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	app.model,
	app.cache || (app.cache = flock()));

