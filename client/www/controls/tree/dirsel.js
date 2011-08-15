////////////////////////////////////////////////////////////////////////////////
// Directory Selector Control
//
// Tree control designed specifically to display directories
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, console */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
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
		console.log("Selecting " + node.data.path());
	}
	
	// directory expand / collapse handler
	// loads child directories on demand
	function onExpandCollapse($node, node) {
		var expanded = $node.hasClass('expanded');
		console.log((expanded ? "Expanding " : "Collapsing ") + node.data.path());
		if (!hasOwnProperties(node.data.json())) {
			console.log("No child nodes.");
			$node
				.removeClass('expanded')
				.addClass('dead');
		}
	}

	controls.dirsel = function () {		
		var self = Object.create(controls.tree(onSelect, onExpandCollapse));
		self
			.build({
				one: { a: {}, b: {}},
				two: { c: {}, d: {}}
			});

		return self;
	};
	
	return controls;
}(yalp.controls,
	jQuery);

