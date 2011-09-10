////////////////////////////////////////////////////////////////////////////////
// Tree node in a tree control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $) {
	controls.node = function (text, tree, path) {
		path = path || [];
		
		var self = controls.control.create(),
				json,
				expanded = false;
				
		//////////////////////////////
		// Getters, setters
		
		// returns path to current node
		self.path = function () {
			return path;
		};

		// returns expanded state
		self.expanded = function () {
			return expanded;
		};
		
		// sets json
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
			var node, keys, i;
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
				// adding child controls according to node names
				for (i = 0; i < keys.length; i++) {
					node = keys[i];
					controls.node(node, tree, path.concat([node]))
						.json(json[node])
						.appendTo(self);
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
				'<li id="', self.id, '" class="', ['node', expanded ? 'expanded' : '', selected() ? 'selected' : ''].join(' '), '">',
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
				node = controls.lookup[$node.attr('id')],
				$tree = $node.closest('div.tree'),
				tree = controls.lookup[$tree.attr('id')];
		
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
				node = controls.lookup[$node.attr('id')],
				$tree = $node.closest('div.tree'),
				tree = controls.lookup[$tree.attr('id')],
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
	
	// applying handlers
	// any non-dead folder can be expanded
	// any folder can be selected
	$('li.node:not(.dead) > span.toggle').live('click', onExpandCollapse);
	$('li.node > span.name').live('click', onSelect);
	
	return controls;
}(app.controls,
	jQuery);

