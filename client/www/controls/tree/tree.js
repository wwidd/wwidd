////////////////////////////////////////////////////////////////////////////////
// Tree Control
//
// Represents a tree with expandable / collapsible nodes
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.tree = function (onSelect, onExpandCollapse) {
		var self = controls.control.create(),
				rootNode,
				selected = [];
		
		//////////////////////////////
		// Setters / getters
		
		self.build = function (json) {
			rootNode = controls.node("/", self)
				.json(json)
				.appendTo(self);
			return self;
		};
		
		self.selected = function (value) {
			if (typeof value !== 'undefined') {
				selected = value;
				return self;
			} else {
				return selected;
			}
		};
		
		//////////////////////////////
		// Custom events
		
		self.onSelect = onSelect || function ($node, node) {};
		self.onExpandCollapse = onExpandCollapse || function ($node, node) {};		

		//////////////////////////////
		// Overrides

		self.html = function () {
			return [
				'<div id="', self.id, '" class="tree">',
				'<span>', "Selected:", '</span>', '<span class="selected"></span>',
				rootNode ? '<ul>' + rootNode.html() + '</ul>' : '',
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(yalp.controls,
	jQuery);

