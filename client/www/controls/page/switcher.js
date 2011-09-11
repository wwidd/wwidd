////////////////////////////////////////////////////////////////////////////////
// Library Switcher
//
// Lists available libraries and switches between them.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.switcher = function () {
		var self = controls.control.create(),
				busy = false,
				selected = '',
				data = {names: []};
				
		//////////////////////////////
		// Initialization

		services.getlibs(function (json) {
			data = json.data;
			selected = json.data.selected;
			
			// detecting in-progress processes
			var processes = json.data.processes,
					progress = processes.thumbnails.progress;
			
			if (progress > 0) {
				controls.library
					.poll();
			} else {
				self.render();
			}
		});

		//////////////////////////////
		// Getters, setters
		
		self.busy = function (value) {
			busy = value;
			return self;
		};
		
		self.selected = function (value) {
			if (typeof value !== 'undefined') {
				selected = value;
				return self;
			} else {
				return selected;
			}
		};

		//////////////////////////////
		// Event handlers

		function onChange() {
			var library = $(this).val();
			
			// changing library
			services.setlib(library, function () {
				selected = library;
				
				// resetting controls
				controls.pager.reset();
				controls.search.reset();
				
				// loading new library contents
				controls.library.load();
			});
		}

		//////////////////////////////
		// Overrides

		self.build = function () {
			controls.rootadd.appendTo(self);
			return self;
		};
		
		self.init = function (elem) {
			// setting state
			if (busy || self.disabled()) {
				elem.find('select')
					.attr('disabled', 'disabled');
			} else {
				elem.find('select')
					.removeAttr('disabled');
			}
			
			if (busy) {
				elem.find('.spinner')
					.show();
			} else {
				elem.find('.spinner')
					.hide();
			}
			
			// adding events
			elem.find('select')
				.change(onChange);
		};

		self.html = function () {
			var names = data.names,
					i,
			result = [
				'<span class="switcher" id="', self.id, '">',
				'<span>Library:</span>',
				'<select>'
			];
			for (i = 0; i < names.length; i++) {
				result.push([
					'<option value="', names[i], '"', names[i] === selected ? ' selected="selected"' : '', '">',
					names[i],
					'</option>'
				].join(''));
			}
			result.push([
				'</select>',
				controls.rootadd.html(),
				'<span class="spinner"></span>',
				'</span>'
			].join(''));
			return result.join('');
		};
		
		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

