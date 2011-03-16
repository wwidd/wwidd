////////////////////////////////////////////////////////////////////////////////
// Kind Control
//
// Displays and switches one tag kind on and off
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.kind = function (row, handler) {
		handler = handler || function () {};
		
		var self = Object.create(controls.base());
		
		self.data.row = row;
		
		//////////////////////////////
		// Event handlers

		// checkbox event handler
		// when checkbox or label is clicked
		function onChecked() {
			var	$this = $(this),
					row = controls.lookup[$this.parent().attr('id')].data.row,
					checked = $this.attr('checked');
			handler(row.kind, checked);
		}
		// when tag background is clicked
		function onClick(event) {
			if (event.target === this) {
				var $this = $(this),
						row = controls.lookup[$this.attr('id')].data.row,
						$checkbox = $this.find(':checkbox'),
						checked = !$checkbox.attr('checked');
				$checkbox.attr('checked', checked);
				handler(row.kind, checked);
			}
		}
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			$('.kind').live('click', onClick);
			$('.kind :checkbox').live('click', onChecked);
			return false;
		};
		
		self.html = function () {
			var id = 'kind' + row.kind;
			return [
				'<span id="', self.id, '" class="kind tag display ', data.kinds.getNumber(row.kind), '">',
				'<input type="checkbox" id="', id, '"', !self.parent || !self.parent.hidden(row.kind) ? ' checked="checked"' : '', '/>',
				'<label for="', id, '">', row.kind ? row.kind : "[default]", '</label>',
				'</span>'
			].join('');
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	data);

