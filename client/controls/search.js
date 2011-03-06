////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.search = function () {
		var base = controls.control,
				self = Object.create(base),
				live = false,
				timer = null;

		self.filter = "";
				
		// runs search
		function search() {
			self.filter = self.UI.val();
			controls.page.load();
		}

		// starts keyup timer and starts search after 300ms
		function startTimer() {
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(search, 300);
		}
		
		// starts search when enter was pressed
		function onEnter(event) {
			if (event.which !== 13) {
				return;
			}
			search();
		}
		
		// sets or gets the 'live' state of the control
		// if live, search starts 300ms after last keyup,
		// if not live, search starts on hitting enter
		self.live = function (state) {
			if (typeof state === 'undefined') {
				return live;
			} else {
				live = state;
				return self;
			}
		};
		
		self.getUI = function () {
			return $('<input type="text" />')
				.addClass('search')
				.keyup(live ? startTimer : onEnter);
		};
				
		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

