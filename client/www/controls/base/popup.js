////////////////////////////////////////////////////////////////////////////////
// General Popup Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $) {
	var TYPES = {
		'centered': 'centered',		// always centered, like a modal dialog
		'context': 'context',			// positions near mouse mask, stays there
		'follow': 'follow'				// follows mouse mask
	};
	
	controls.popup = function (type) {
		type = type || 'context';
		
		var self = controls.control.create(),
				$window = $(window),
				position = {};
			
		// sets static mouse position
		self.position = function (value) {
			position = value;
			return this;
		};
		
		//////////////////////////////
		// Event handlers

		// mouse move event handler
		// - dims: dimensions of elem(Height / Width) and window(Height / Width)
		function onMouseMove(event, elem, dims) {
			// we need the top left of the mouse cursor
			var pageX = (event ? event : position).pageX - 8,
					pageY = (event ? event : position).pageY - 8;
			elem.css({
				top: dims.windowHeight > pageY + dims.elemHeight ? pageY : pageY - dims.elemHeight,
				left: dims.windowWidth > pageX + dims.elemWidth ? pageX : pageX - dims.elemWidth
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
		
		// acquires element and window dimensions
		function getDims(elem) {
			return {
				elemHeight: elem.outerHeight(true),
				elemWidth: elem.outerWidth(true),
				windowHeight: $window.height(),
				windowWidth: $window.width()
			};
		}
		
		function onClickOutside(event, popup) {
			// checking whether user actually clicked outside of popup
			if (!$(event.target).closest('#' + self.id).length) {
				// removing popup
				popup
					.remove()
					.render();
			} else {
				// re-binding event handler
				$('body').one('mousedown', function (event) {
					onClickOutside(event, popup);
				});
			}
		}

		self.init = function (elem) {
			var dims,
					that = this;
			switch (type) {
			case 'centered':
				onResize(elem);
				$(window).bind('resize', function (event) {
					onResize(elem);
				});
				break;
			case 'follow':
				dims = getDims(elem);
				onMouseMove(null, elem, dims);
				$('body').bind('mousemove', function (event) {
					onMouseMove(event, elem, dims);
				});
				break;
			default:
			case 'context':
				dims = getDims(elem);
				onMouseMove(null, elem, dims);
				$('body').one('mousedown', function (event) {
					onClickOutside(event, that);
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
}(app.controls || {},
	jQuery);

