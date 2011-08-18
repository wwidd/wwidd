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
		
		var self = controls.control.create(),
				$window = $(window);
				
		//////////////////////////////
		// Event handlers

		// mouse move event handler
		// - dims: dimensions of elem(Height / Width) and window(Height / Width)
		function onMouseMove(event, elem, dims) {
			elem.css({
				top: dims.windowHeight > event.pageY + dims.elemHeight ? event.pageY : event.pageY - dims.elemHeight,
				left: dims.windowWidth > event.pageX + dims.elemWidth ? event.pageX : event.pageX - dims.elemWidth
			});
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
			var elemHeight, elemWidth,
					windowHeight, windowWidth;
			switch (type) {
			case 'centered':
				onResize(elem);
				$(window).bind('resize', function (event) {
					onResize(elem);
				});
				break;
			default:
			case 'follow':
				elemHeight = elem.outerHeight(true);
				elemWidth = elem.outerWidth(true);
				windowHeight = $window.height();
				windowWidth = $window.width();
				$('body').bind('mousemove', function (event) {
					onMouseMove(event, elem, {
						elemHeight: elemHeight,
						elemWidth: elemWidth,
						windowHeight: windowHeight,
						windowWidth: windowWidth
					});
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

