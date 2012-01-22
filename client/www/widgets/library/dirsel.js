////////////////////////////////////////////////////////////////////////////////
// Directory Selector Control
//
// Tree widget designed specifically to display directories
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, services) {
	//////////////////////////////
	// Static helper functions

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

	//////////////////////////////
	// Static event handlers

	// directory selection handler
	function onSelected(event, options) {
		var $node = options.elem,
				node = options.node,
				self = wraith.lookup($node, '.w_popup');
				
		self.btnOk()
			.disabled({self: false})
			.render();
	}
	
	// directory expand / collapse handler
	// loads child directories on demand
	function onExpandCollapse(event, options) {
		var $node = options.elem,
				node = options.node,
				expanded = node.expanded(),
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

	//////////////////////////////
	// Static event bindings

	$(document)
		.on('nodeExpandCollapse', '.w_dirsel', onExpandCollapse)
		.on('nodeSelected', '.w_dirsel', onSelected);
	
	//////////////////////////////
	// Class

	widgets.dirsel = function () {		
		var self = wraith.widget.create(widgets.popup('centered')),
				base_init = self.init,
				tree = widgets.tree(),
				btnCancel = widgets.button("Cancel"),
				btnOk = widgets.button("OK").disabled({self: true});
		
		// initial service call for root dirs
		services.sys.dirlist(null, function (json) {
			// initial tree contents
			tree
				.json(json.data)
				.appendTo(self);
				
			// re-rendering entire widget
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
			elem
				.addClass('w_dirsel')
				.find('div.spinner')
					.show()
				.end()
				.find('table.status')
					.insertAfter(elem.find('ul.root'));
					
			// calling base init at the END
			// because base init relies on final dimensions
			base_init.apply(self, arguments);
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
	
	return widgets;
}(app.widgets,
	jQuery,
	wraith,
	app.services);

