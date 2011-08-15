////////////////////////////////////////////////////////////////////////////////
// Tree node in a tree control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.node = function (text, tree, path) {
		path = path || [];
		
		var self = Object.create(controls.control()),
				json,
				expanded = false;
		
		//////////////////////////////
		// External
		
		// returns path to current node
		self.data.path = function () {
			return path;
		};
		
		// sets json
		self.data.json = function (value) {
			if (typeof value !== 'undefined') {
				json = value;
				return self;
			} else {
				return json;
			}
		};
		
		// toggles expanded / collapsed state
		self.data.toggle = function () {
			expanded = !expanded;
			return self
				.clear()
				.render();
		};
		
		//////////////////////////////
		// Getters, setters
		
		self.json = self.data.json;
		
		//////////////////////////////
		// Overrides

		// builds the node with subnodes as specified by json
		function build() {
			var node;
			if (json && expanded) {
				for (node in json) {
					if (json.hasOwnProperty(node)) {
						controls.node(node, tree, path.concat([node]))
							.json(json[node])
							.appendTo(self);
					}
				}
			}
			return self;
		}

		// returns whether the current node is selected
		function selected() {
			return tree.data.selected.join('/') === path.join('/');
		}
		
		self.html = function () {
			build();
			
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
		$node = node.data.toggle();
		
		// calling tree's handler on expand / collapse event
		tree.data.onExpandCollapse($node, node);
		
		return false;
	}
	
	// directory selection button
	function onSelect() {
		// obtaining necessary objects (current node & tree)
		var	$node = $(this).parent(),
				node = controls.lookup[$node.attr('id')],
				$tree = $node.closest('div.tree'),
				tree = controls.lookup[$tree.attr('id')];
		
		// setting selected status on current node
		$tree
			.find('span.selected')
				.text('/' + node.data.path().join('/'))
			.end()
			.find('li')
				.removeClass('selected')
			.end();
		$node.addClass('selected');
		
		// storing selected path and calling tree's handler
		tree.data.selected = node.data.path();
		tree.data.onSelect($node, node);

		return false;
	}
	
	$('span.toggle').live('click', onExpandCollapse);
	$('div.tree span.name').live('click', onSelect);
	
	return controls;
}(yalp.controls,
	jQuery);

