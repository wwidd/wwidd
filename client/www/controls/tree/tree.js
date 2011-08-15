////////////////////////////////////////////////////////////////////////////////
// Directory Selector Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.tree = function () {
		var self = Object.create(controls.control()),
				rootNode;
		
		//////////////////////////////
		// External
		
		self.data.selected = [];			// selected path
				
		//////////////////////////////
		// Setters / getters
		
		self.build = function (json) {
			rootNode = controls.node("/", self)
				.json(json)
				.appendTo(self);
			return self;
		};
		
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

