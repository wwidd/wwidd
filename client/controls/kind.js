////////////////////////////////////////////////////////////////////////////////
// Kind Control
//
// Displays and switches one tag kind on and off
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.kind = function (row, handler) {
		var self = Object.create(controls.control);
		
		// checkbox event handler
		function onChecked() {
			var checked = $(this).attr('checked');
			if (handler) {
				handler(row.kind, checked);
			}
		}
		
		// dropdown representation
		self.getUI = function () {
			var id = 'kind' + row.kind;
			
			return $('<span />', {'class': 'tag'})
				.addClass(data.kinds.getNumber(row.kind))
				.append($('<input type="checkbox">')
					.attr('id', id)
					.attr('checked', !self.parent.hidden(row.kind))
					.click(onChecked))
				.append($('<label />')
					.attr('for', id)
					.text(row.kind ? row.kind : "[default]"));
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	data);

