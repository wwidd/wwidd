////////////////////////////////////////////////////////////////////////////////
// Tree node in a tree widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
	widgets.node = function (text, tree, path) {
		path = path || [];
		
		var self = wraith.widget.create(),
				json,
				expanded = false;
				
		//////////////////////////////
		// Getters, setters
		
		self.path = function () {
			return path;
		};

		self.text = function () {
			return text;
		};
		
		self.expanded = function () {
			return expanded;
		};
		
		self.json = function (value) {
			if (typeof value !== 'undefined') {
				json = value;
				return self;
			} else {
				return json;
			}
		};
		
		//////////////////////////////
		// Control
		
		// toggles expanded / collapsed state
		self.toggle = function () {
			expanded = !expanded;
			return self
				.clear()
				.build()
				.render();
		};
		
		//////////////////////////////
		// Overrides

		// builds the node with subnodes as specified by json
		self.build = function () {
			var node, keys, i, tmp;
			
			if (json && expanded) {
				// obtaining sorted array of node names
				keys = [];
				for (node in json) {
					if (json.hasOwnProperty(node)) {
						keys.push(node);
					}
				}
				keys.sort(function (a, b) {
					a = a.toLowerCase();
					b = b.toLowerCase();
					return a > b ? 1 : a < b ? -1 : 0; 
				});
				
				// adding child widgets according to node names
				for (i = 0; i < keys.length; i++) {
					node = keys[i];
					tmp = tree.onDisplay(path.concat([node]));
					if (typeof tmp === 'undefined' || tmp !== false) {
						widgets.node(tmp || node, tree, path.concat([node]))
							.json(json[node])
							.appendTo(self);
					}
				}
			}
			return self;
		};

		// returns whether the current node is selected
		function selected() {
			return tree.selected().join('/') === path.join('/');
		}
		
		self.html = function () {
			return [
				'<li id="', self.id, '" class="', ['w_node', expanded ? 'expanded' : '', selected() ? 'selected' : ''].join(' '), '">',
				'<span class="toggle"></span>',
				'<span class="name">', text, '</span>',
				'<ul>',
				function () {
					var result = [],
							i;
					for (i = 0; i < self.children.length; i++) {
						result.push(self.children[i].html());
					}
					return result.join('');
				}(),
				'</ul>',
				'</li>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers

	// expand / collapse button handler
	function onExpandCollapse() {
		// obtaining necessary objects (current node & tree)
		var	$node = $(this).parent(),
				node = wraith.lookup($node),
				$tree = $node.closest('div.w_tree'),
				tree = wraith.lookup($tree);
		
		// toggling expanded state of current node
		$node = node.toggle();
		
		// calling tree's handler on expand / collapse event
		tree.onExpandCollapse($node, node);
		
		return false;
	}
	
	// directory selection button
	function onSelect() {
		// obtaining necessary objects (current node & tree)
		var	$node = $(this).parent(),
				node = wraith.lookup($node),
				$tree = $node.closest('div.w_tree'),
				tree = wraith.lookup($tree),
				path = '/' + node.path().join('/');

		// setting selected status on current node
		$tree
			.find('span.selected')
				.text(path)
				.attr('title', path)
			.end()
			.find('li')
				.removeClass('selected')
			.end();
		$node.addClass('selected');
		
		// storing selected path and calling tree's handler
		tree.selected(node.path());
		tree.onSelect($node, node);

		return false;
	}
	
	//////////////////////////////
	// Static event bindings

	// any non-dead folder can be expanded
	// any folder can be selected
	$('li.w_node:not(.dead) > span.toggle').live('click', onExpandCollapse);
	$('li.w_node > span.name').live('click', onSelect);
	
	return widgets;
}(app.widgets,
	jQuery,
	wraith);

