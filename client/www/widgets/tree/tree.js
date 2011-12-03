////////////////////////////////////////////////////////////////////////////////
// Tree Control
//
// Represents a tree with expandable / collapsible nodes
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
	widgets.tree = function () {
		var that = arguments.callee,
				self = wraith.widget.create(),
				json,
				rootNode,
				simple = false,
				selected = [],
		
		// custome event handlers
		onDisplay,
		onSelect,
		onExpandCollapse;
		
		//////////////////////////////
		// Setters / getters
		
		self.json = function (value) {
			if (typeof value === 'object') {
				json = value;
				return self;
			} else {
				return json;
			}
		};
		
		self.simple = function (value) {
			if (typeof value === 'boolean') {
				simple = value;
				return self;
			} else {
				return simple;
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
		
		self.onDisplay = function (value) {			
			if (typeof value === 'function') {
				onDisplay = value;
				return self;
			} else if (typeof onDisplay === 'function') {
				return onDisplay.apply(self, arguments);
			}
		};
		
		self.onSelect = function (value) {			
			if (typeof value === 'function') {
				onSelect = value;
				return self;
			} else if (typeof onSelect === 'function') {
				return onSelect.apply(self, arguments);
			}
		};
		
		self.onExpandCollapse = function (value) {
			if (typeof value === 'function') {
				onExpandCollapse = value;
				return self;
			} else if (typeof onExpandCollapse === 'function') {
				return onExpandCollapse.apply(self, arguments);
			}
		};

		//////////////////////////////
		// Overrides

		self.build = function () {
			rootNode = widgets.node(onDisplay ? onDisplay([]) || '/' : '/', self)
				.json(json)
				.appendTo(self);
			return self;
		};
		
		self.html = function () {
			return [
				'<div id="', self.id, '" class="w_tree">',
				simple ? '' : [
					'<table class="status">',
					'<colgroup>',
					'<col class="key">',
					'<col class="value">',
					'</colgroup>',
					'<tr>', '<td><span>', "Selected:", '</span></td>', '<td><span class="selected">&nbsp;</span></td>', '</tr>',
					'</table>'
				].join(''),
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

