////////////////////////////////////////////////////////////////////////////////
// General Popup Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	var TYPES = {
		'centered': 'centered',
		'follow': 'follow'
	};
	
	controls.popup = function () {
		var self = Object.create(controls.control()),
				type = 'follow',
				base_remove = self.remove;
		
		//////////////////////////////
		// Event handlers

		function onMouseMove(event, elem) {
			elem.css({top: event.pageY + 5, left: event.pageX + 5});			
		}
		
		//////////////////////////////
		// Setters
		
		// sets position type
		self.type = function (value) {
			type = TYPES[value] || 'follow'; 
		};
		
		//////////////////////////////
		// Overrides

		// constructs the specific contents of the popup
		self.contents = null;
		
		self.init = function (elem) {
			switch (type || 'follow') {
			case 'centered':
				break;
			default:
			case 'follow':
				$('body').bind('mousemove', function (event) {
					onMouseMove(event, elem);
				});
				break;
			}
		};

		self.html = function () {
			return [
				'<div id="', self.id, '" class="popup">',
				this.contents(),
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(yalp.controls || {},
	jQuery);

