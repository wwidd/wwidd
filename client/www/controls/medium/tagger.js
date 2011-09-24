////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.tagger = function (row) {
		var	self = controls.control.create(),
				adder;
		
		self.data.row = row;
		
		//////////////////////////////
		// Utility functions

		self.add = function () {
			adder.toggle('edit');
		};
		
		//////////////////////////////
		// Overrides

		self.build = function () {
			self.clear();

			// adding tag editor controls
			var i;
			for (i = 0; i < row.tags.length; i++) {
				controls.tagedit(row, row.tags[i])
					.appendTo(self);
			}
			
			// adding tag adder control
			adder = controls.tagadd(row)
				.appendTo(self);
				
			return self;
		};
		
		self.html = function () {
			var result = ['<div id="', self.id, '" class="tagger">'],
					i, child;
			// adding html for tag controls of visible kinds
			for (i = 0; i < self.children.length; i++) {
				child = self.children[i];
				if (!child.kind || !controls.kinds.hidden(child.kind())) {
					result.push(child.html());
				}
			}
			result.push('</div>');			
			return result.join('');
		};
		
		return self;
	};
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

