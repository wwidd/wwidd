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
		
		self.data.path = path;		// path to current node
		
		// toggles expanded / collapsed state
		self.data.toggle = function () {
			expanded = !expanded;
			return self
				.clear()
				.render();
		};
		
		//////////////////////////////
		// Getters, setters
		
		self.json = function (value) {
			json = value;
			return self;
		};
		
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
			return tree.data.selected.join('/') === self.data.path.join('/');
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
		var	$node = $(this).parent(),
				control = controls.lookup[$node.attr('id')],
				$tree = $node.closest('div.tree'),
				tree = controls.lookup[$tree.attr('id')];
		control.data.toggle();
		return false;
	}
	
	// directory selection button
	function onSelect() {
		var	$node = $(this).parent(),
				control = controls.lookup[$node.attr('id')],
				$tree = $node.closest('div.tree'),
				tree = controls.lookup[$tree.attr('id')];
		$tree.find('li').removeClass('selected');
		$node.addClass('selected');
		tree.data.selected = control.data.path;
		return false;
	}
	
	$('span.toggle').live('click', onExpandCollapse);
	$('div.tree span.name').live('click', onSelect);
	
	return controls;
}(yalp.controls,
	jQuery);

