////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.tagger = function (row) {
		var	self = Object.create(controls.base()),
				adder;

		self.data.row = row;
				
		//////////////////////////////
		// Utility functions

		self.add = function () {
			$('#' + adder.id).click();
		};
		
		//////////////////////////////
		// Overrides

		self.html = function () {
			var tags = row.tags,
					result = ['<div id="', self.id, '">'],
					i, kind, control;
			
			// adding tag editor controls
			for (i = 0; i < tags.length; i++) {
				kind = tags[i].split(':')[1];
				if (!controls.kinds.hidden(kind)) {
					result.push(
						controls.tagedit(row, tags[i])
							.appendTo(self)
							.html()
					);
				}
			}
			
			// adding tag adder control
			result.push(
				(adder = controls.tagadd(row))
					.appendTo(self)
					.html());

			result.push('</div>');
			
			return result.join('');
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

