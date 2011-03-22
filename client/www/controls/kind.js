////////////////////////////////////////////////////////////////////////////////
// Kind Control
//
// Displays and switches one tag kind on and off
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.controls = function (controls, $, data) {
	controls.kind = function (row, handler) {
		var self = Object.create(controls.control());
		
		self.data.row = row;
		self.data.handler = handler || function () {};
		
		//////////////////////////////
		// Overrides

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
	
	//////////////////////////////
	// Static event handlers
	
	// checkbox event handler
	// when checkbox or label is clicked
	function onChecked() {
		var	$this = $(this),
				control = controls.lookup[$this.parent().attr('id')],
				row = control.data.row,
				handler = control.data.handler,
				checked = $this.attr('checked');
		handler(row.kind, checked);
	}
	
	// when tag background is clicked
	function onClick(event) {
		if (event.target === this) {
			var $this = $(this),
					control = controls.lookup[$this.attr('id')],
					row = control.data.row,
					handler = control.data.handler,
					$checkbox = $this.find(':checkbox'),
					checked = !$checkbox.attr('checked');
			$checkbox.attr('checked', checked);
			handler(row.kind, checked);
		}
	}

	$('.kind').live('click', onClick);
	$('.kind :checkbox').live('click', onChecked);

	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.data);

