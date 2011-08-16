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
	// dummy function, unused
	function onSelect($node, node) {
	}
	
	// directory expand / collapse handler
	// loads child directories on demand
	function onExpandCollapse($node, node) {
		var expanded = node.expanded(),
				empty = !hasOwnProperties(node.json());
	
		// acquiring sub-nodes when expanding an empty node
		if (expanded && empty) {
			services.getdirs(node.path().join('/'), function (json) {
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
		var self = Object.create(controls.tree(onSelect, onExpandCollapse));
		
		// initial service call for root dirs
		services.getdirs('home,media', function (json) {
			self
				.build(json.data)
				.render();
		});

		return self;
	};
	
	return controls;
}(yalp.controls,
	jQuery,
	yalp.services);

