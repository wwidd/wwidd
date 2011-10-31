////////////////////////////////////////////////////////////////////////////////
// General Popup Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $) {
	var TYPES = {
		'centered': 'centered',		// always centered, like a modal dialog
		'context': 'context',			// positions near mouse mask, stays there
		'dropdown': 'dropdown',		// same as context but doesn't bind 'click outside'
		'follow': 'follow'				// follows mouse mask
	};
	
	controls.popup = function (type) {
		type = type || 'context';
		
		var self = controls.control.create(),
				$window = $(window),		// frequently used window object
				anchor;									// position anchor object for dropdown
			
		//////////////////////////////
		// Getters, setters

		// sets anchor jQuery elem for dropdown popup
		self.anchor = function (value) {
			anchor = value;
			return this;
		};
		
		//////////////////////////////
		// Event handlers

		// mouse move event handler
		// - dims: dimensions of elem(Height / Width) and window(Height / Width)
		function onMouseMove(event, elem, dims) {
			var offset, pos,
					pageX, pageY;
			
			// obtaining element position
			if (!event && typeof anchor !== 'undefined') {
				offset = anchor.offset();
				pos = {
					pageX: offset.left,
					pageY: offset.top + anchor.outerHeight(true)
				};
			} else {
				pos = event;
			}
			
			if (pos) {
				// we need the top left of the mouse cursor
				pageX = pos.pageX - 8;
				pageY = pos.pageY - 8;
				
				elem.css({
					top: dims.windowHeight > pageY + dims.elemHeight ? pageY : pageY - dims.elemHeight,
					left: dims.windowWidth > pageX + dims.elemWidth ? pageX : pageX - dims.elemWidth
				});
			}
		}
		
		// resize handler for centered popup
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
				popup.render(null);
			} else {
				// re-binding event handler
				$('body').one(event.type, function (event) {
					onClickOutside(event, popup);
				});
			}
			return false;
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
			case 'dropdown':
				dims = getDims(elem);
				onMouseMove(null, elem, dims);
				$(window).bind('resize', function (event) {
					onMouseMove(null, elem, dims);
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
				'<div id="', self.id, '" class="', ['w_popup', TYPES[type] || 'follow'].join(' '), '">',
				this.contents(),
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(app.controls || {},
	jQuery);

