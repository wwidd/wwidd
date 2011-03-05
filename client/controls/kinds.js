////////////////////////////////////////////////////////////////////////////////
// Kind Selector Control
//
// Lets teh user control what kind of tags are visible
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, data) {
	controls.kinds = function () {
		var self = Object.create(controls.control),
				onChecked = function () {},
				hidden = {};

		// event handler setter
		self.onChecked = function (handler) {
			onChecked = handler;
			return self;
		};
		
		// gets the hidden property of a kind
		self.hidden = function (kind) {
			return hidden[kind];
		};
			
		// function called on kind check
		function handler(kind, state) {
			if (state) {
				delete hidden[kind];
			} else {
				hidden[kind] = true;
			}
			onChecked();
			return self;
		}

		// dropdown representation
		self.getUI = function () {
			var $kinds = $('<span />'),
					flat = data.kinds.table.flat(),
					i;
			for (i = 0; i < flat.length; i++) {
				controls.kind(flat[i], handler).appendTo($kinds, self);
			}
			return $kinds;
		};

		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	data);

