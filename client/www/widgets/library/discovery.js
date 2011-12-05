////////////////////////////////////////////////////////////////////////////////
// Discovery Widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, flock */
var app = app || {};

app.widgets = function (widgets, $, wraith, model, cache) {
	// selection event handler
	// prohibits selection of non-filtering nodes
	// TODO: filtering library on filtering nodes
	function onSelect($node, node) {
		var path = node.path(),
				depth = path.length,
				main = path[0];
				
		if (depth === 0 ||
			depth < 2 && path[0] === 'rating' ||
			depth < 2 && path[0] === 'kind') {
			return false;
		} else {
			model.media.filter(path);
			widgets.pager.reset();
			widgets.media.refresh();
			widgets.url.set();
		}
	}
	
	// specifies how sub-nodes should be ordered
	function order(path) {
		var depth = path.length,
				key = path[depth - 1],
				count = cache.get(path.concat(['count']));
				
		if (typeof count === 'number') {
			// ordering by count desc when node has count
			return 0 - count;
		} else {
			// ordering by node key in any other case
			return key;
		}
	}
	
	// specifies what to display depending on node keys
	function display(path) {
		var depth = path.length,
				text = path[depth - 1],
				count;
				
		switch (depth) {
		case 0:
			// topmost node
			return "full library";
		case 1:
			// first-level node "by ..."
			return {
				'rating': "by rating",
				'kind': "by tags"
			}[text] || false;
		case 2:
			switch (path[0]) {
			case 'rating':
				text = text ? widgets.rater.html(text) : "[unrated]";
				break;
			case 'kind':
				return text ? widgets.tagedit.html(text, text) : "[uncategorized]";
			}
			break;
		case 3:
			if (path[0] === 'kind') {
				text = widgets.tagedit.html(text, path[1]);
			}
			break;
		}

		// third or lower level
		// cutting branches
		if (depth > 2 && path[0] === 'rating' ||
			depth > 3 && path[0] === 'kind') {
			return false;
		}
		
		// assessing count
		count = cache.get(path.concat(['count']));
		if (typeof count === 'number') {
			return text + ' (' + count + ')';
		}
	}
	
	widgets.discovery = function () {
		var self = wraith.widget.create(),
				tree = widgets.tree()
					.onSelect(onSelect)
					.display(display)
					.order(order)
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

