////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, data) {
	controls.tagger = function (mediaid) {
		var	self = controls.control.create(),
				adder;
		
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
			var row = data.media.getRow(mediaid),
					i;
			for (i = 0; i < row.tags.length; i++) {
				controls.tagedit(mediaid, row.tags[i])
					.appendTo(self);
			}
			
			// adding tag adder control
			adder = controls.tagadd(mediaid)
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
	app.data);

