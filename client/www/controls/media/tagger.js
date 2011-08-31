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

		function build() {
			var i, kind;
			self.clear();
			for (i = 0; i < row.tags.length; i++) {
				kind = row.tags[i].split(':')[1];
				if (!controls.kinds.hidden(kind)) {
					controls.tagedit(row, row.tags[i]).appendTo(self);
				}
			}
			adder = controls.tagadd(row).appendTo(self);
		}
		
		self.html = function () {
			build();
			
			var result = ['<div id="', self.id, '">'],
					i;
			for (i = 0; i < self.children.length; i++) {
				result.push(self.children[i].html());
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

