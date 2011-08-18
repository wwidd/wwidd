////////////////////////////////////////////////////////////////////////////////
// Directory Selector Control
//
// Tree control designed specifically to display directories
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	// tells whether an object has any own propertes
	function hasOwnProperties(obj) {
		var prop;
		for (prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return true;
			}
		}
		return false;
	}				

	// directory selection handler
	function onSelect($node, node) {
		var $dirsel = $node.closest('div.popup');
		$dirsel
			.find('button.ok')
				.removeAttr('disabled');
	}
	
	// directory expand / collapse handler
	// loads child directories on demand
	function onExpandCollapse($node, node) {
		var expanded = node.expanded(),
				empty = !hasOwnProperties(node.json()),
				$spinner;
	
		// acquiring sub-nodes when expanding an empty node
		if (expanded && empty) {
			$spinner = $node
				.closest('div.popup')
					.find('div.spinner')
						.show();
			services.getdirs(node.path().join('/'), function (json) {
				$spinner.hide();
				empty = !hasOwnProperties(json.data);
				if (empty) {
					// no subdirs, removing expand button
					$node
						.removeClass('expanded')
						.addClass('dead');
				} else {
					// has subdirs, creating child nodes
					node
						.json(json.data)
						.render();
				}
			});
		}
	}

	controls.dirsel = function () {		
		var self = controls.control.create(controls.popup('centered')),
				base_init = self.init,
				tree = controls.tree(onSelect, onExpandCollapse),
				onCancel, onOk;
		
		// initial service call for root dirs
		services.getdirs(null, function (json) {
			// initial tree contents
			tree
				.build(json.data)
				.appendTo(self);
				
			// re-rendering full control
			self
				.render()
				.find('div.spinner')
					.hide();
		});

		//////////////////////////////
		// Setters / getters

		self.onCancel = function (value) {
			onCancel = value;
			return self;
		};
		
		self.onOk = function (value) {
			onOk = value;
			return self;
		};
		
		self.selected = function () {
			return '/' + tree.selected().join('/');
		};
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			base_init.call(self, elem);
			elem
				.find('table.status')
					.insertAfter(elem.find('ul.root'));
			elem
				.find('button.cancel')
					.click(onCancel)
				.end()
				.find('button.ok')
					.click(onOk)
				.end();
		};
		
		self.contents = function () {
			return [
				'<div class="spinner"></div>',
				'<span class="title">', "Add folder to library", '</span>',
				tree.html(),
				'<button type="button" class="ok" disabled="disabled">', "OK", '</button>',
				'<button type="button" class="cancel">', "Cancel", '</button>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(yalp.controls,
	jQuery,
	yalp.services);

