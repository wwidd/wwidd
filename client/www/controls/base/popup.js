////////////////////////////////////////////////////////////////////////////////
// General Popup Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	var TYPES = {
		'centered': 'centered',
		'follow': 'follow'
	};
	
	controls.popup = function (type) {
		type = type || 'follow';
		
		var self = controls.control.create();
		
		//////////////////////////////
		// Event handlers

		function onMouseMove(event, elem) {
			elem.css({top: event.pageY + 5, left: event.pageX + 5});
		}
		
		function onResize(elem) {
			var $window = $(window);
			elem.css({top: ($window.height() - elem.height()) / 2, left: ($window.width() - elem.width()) / 2});
		}
		
		//////////////////////////////
		// Overrides

		// constructs the specific contents of the popup
		self.contents = null;
		
		self.init = function (elem) {
			switch (type) {
			case 'centered':
				onResize(elem);
				$(window).bind('resize', function (event) {
					onResize(elem);
				});
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
				'<div id="', self.id, '" class="', ['popup', TYPES[type] || 'follow'].join(' '), '">',
				this.contents(),
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(yalp.controls || {},
	jQuery);

