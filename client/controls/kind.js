////////////////////////////////////////////////////////////////////////////////
// Kind Control
//
// Displays and switches one tag kind on and off
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.kind = function (row, handler) {
		handler = handler || function () {};
		
		var self = Object.create(controls.control);
		
		// checkbox event handler
		// when checkbox or label is clicked
		function onChecked() {
			var checked = $(this).attr('checked');
			handler(row.kind, checked);
		}
		// when tag background is clicked
		function onClick(event) {
			if (event.target === this) {
				var $checkbox = $(this).find(':checkbox'),
						checked = !$checkbox.attr('checked');
				$checkbox.attr('checked', checked);
				handler(row.kind, checked);
			}
		}
		
		// dropdown representation
		self.getUI = function () {
			var id = 'kind' + row.kind;

			return $('<span />', {'class': 'tag display'})
				.click(onClick)
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

