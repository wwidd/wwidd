////////////////////////////////////////////////////////////////////////////////
// Directory Selector Control
//
// Tree control designed specifically to display directories
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
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
		var self = controls.lookup[$node.closest('.w_popup').attr('id')];
		self.btnOk()
			.disabled({self: false})
			.render();
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
				.closest('.w_popup')
					.find('.spinner')
						.show();
			services.sys.dirlist(node.path().join('/'), function (json) {
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
						.build()
						.render();
				}
			});
		}
	}

	controls.dirsel = function () {		
		var self = controls.control.create(controls.popup('centered')),
				base_init = self.init,
				tree = controls.tree(onSelect, onExpandCollapse),
				btnCancel = controls.button("Cancel"),
				btnOk = controls.button("OK").disabled({self: true});
		
		// initial service call for root dirs
		services.sys.dirlist(null, function (json) {
			// initial tree contents
			tree
				.json(json.data)
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
			btnCancel.onClick(value);
			return self;
		};
		
		self.btnOk = function () {
			return btnOk;
		};
		
		self.onOk = function (value) {
			btnOk.onClick(value);
			return self;
		};
		
		self.selected = function () {
			return '/' + tree.selected().join('/');
		};
		
		//////////////////////////////
		// Overrides

		self.build = function () {
			btnOk.appendTo(self);
			btnCancel.appendTo(self);
			return self;
		};
		
		self.init = function (elem) {
			base_init.call(self, elem);
			elem
				.find('div.spinner')
					.show()
				.end()
				.find('table.status')
					.insertAfter(elem.find('ul.root'));
		};
		
		self.contents = function () {
			return [
				'<div class="spinner"></div>',
				'<span class="title">', "Add folder to library", '</span>',
				tree.html(),
				btnOk.html(),
				btnCancel.html()
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(app.controls,
	jQuery,
	app.services);

