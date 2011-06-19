////////////////////////////////////////////////////////////////////////////////
// Editable Control
//
// Controls based on this class have typically two states: one for
// displaying (default) and one for editing its value. The latter becomes
// available when clicking on the display state.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, yalp */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.editable = function () {
		var self = Object.create(controls.control());
		
		// mode can be either 'display' or 'edit'
		self.mode = 'display';
		
		//////////////////////////////
		// Utility functions
	
		// switches to mode / between modes
		self.toggle = function (mode) {
			this.mode = mode || {'display': 'edit', 'edit': 'display'}[this.mode];
			var elem = this.render(),
					that = this;
			if (mode === 'edit') {
				elem.find('.focus').focus();
				$('body').one('click', function (event) {
					onClickOutside(event, that, elem);
				});
			}
			return elem;
		};
		
		//////////////////////////////
		// Overrides
		
		// constructs display representation
		self.display = function () {
			throw "Abstract";
		};
		
		// constructs editable representation
		self.edit = function () {
			throw "Abstract";
		};
				
		self.html = function () {
			// storing descendant  instance
			self.data.that = this;
			
			// generating html according to mode
			if (this.mode === 'edit') {
				return this.edit();
			} else {
				return this.display();
			}
		};
		
		return self;
	};

	//////////////////////////////
	// Static event handlers

	// 'click outside' handler
	function onClickOutside(event, self, elem) {
		if (event.target !== (elem.find('input,select')[0] || elem[0])) {
			// handling actual click outside event
			self.toggle('display');
		} else {
			// re-binding one time handler
			$('body').one('click', function (event) {
				onClickOutside(event, self, elem);
			});
		}
		return false;
	}
	
	function onClick() {
		// switching display w/ edit
		var self = controls.lookup[$(this).attr('id')].data.that,
				elem = self.toggle('edit');
		
		// emulating a 'click outside' event
		$('body').one('click', function (event) {
			onClickOutside(event, self, elem);
		});
		
		return false;
	}

	$('.editable').live('click', onClick);
	
	return controls;
}(yalp.controls || {},
	jQuery);
