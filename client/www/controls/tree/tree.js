////////////////////////////////////////////////////////////////////////////////
// Tree Control
//
// Represents a tree with expandable / collapsible nodes
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
	widgets.tree = function (onSelect, onExpandCollapse) {
		var self = wraith.widget.create(),
				json,
				rootNode,
				selected = [];
		
		//////////////////////////////
		// Setters / getters
		
		self.json = function (value) {
			if (typeof value !== 'undefined') {
				json = value;
				return self;
			} else {
				return json;
			}
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

		self.build = function () {
			rootNode = widgets.node("/", self)
				.json(json)
				.appendTo(self);
			return self;
		};
		
		self.html = function () {
			return [
				'<div id="', self.id, '" class="tree">',
				'<table class="status">',
				'<colgroup>',
				'<col class="key">',
				'<col class="value">',
				'</colgroup>',
				'<tr>', '<td><span>', "Selected:", '</span></td>', '<td><span class="selected">&nbsp;</span></td>', '</tr>',
				'</table>',
				rootNode ? '<ul class="root">' + rootNode.html() + '</ul>' : '',
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	return widgets;
}(app.widgets,
	jQuery,
	wraith);

