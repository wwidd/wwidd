////////////////////////////////////////////////////////////////////////////////
// Library Selector Control
//
// Lets the user control what kind of tags are visible
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services) {
	controls.libs = function () {
		var	self = controls.control.create(controls.popup('dropdown')),
				options = [],
				selected = '',
				data = {names: []},
				onChange;
		
		//////////////////////////////
		// Initialization

		services.lib.getall(function (json) {
			data = json.data;
			selected = json.data.selected;
			
			var processes = json.data.processes,
					progress = processes.thumbnails.progress,
					names = data.names,
					i;
			
			// initializing selector contents
			options = [];
			for (i = 0; i < names.length; i++) {
				options.push(names[i]);
			}
			
			// detecting in-progress processes
			if (progress > 0) {
				controls.library
					.poll();
			} else {
				self.render();
			}
			
			// calling external handler
			if (onChange) {
				onChange(selected);
			}
		});

		//////////////////////////////
		// Getters, setters

		self.onChange = function (value) {
			onChange = value;
			return self;
		};
		
		self.selected = function (value) {
			if (typeof value !== 'undefined') {
				selected = value;
				onChange(selected);
				return self;
			} else {
				return selected;
			}
		};

		//////////////////////////////
		// Overrides

		self.contents = function () {
			var result = ['<div class="libs">'],
					i;
			for (i = 0; i < options.length; i++) {
				result.push([
					'<div class="lib">',
					options[i] === selected ?
						'<span class="name">' + options[i] + '</span>' :					
						'<a href="#!" class="name">' + options[i] + '</a>',
					'</div>'
				].join(''));
			}
			result.push('</div>');
			return result.join('');
		};

		return self;
	}();
	
	//////////////////////////////
	// Static event handlers

	function getSelf(elem) {
		return controls.lookup[elem.closest('.dropdown').attr('id')];
	}
	
	function onSelect(event) {
		var $this = $(this),
				self = getSelf($this),
				name = $this.text();

		// changing library
		services.lib.select(name, function () {
			// resetting controls
			controls.pager.reset();
			controls.search.reset();
			controls.url.set();
			
			self.selected(name);

			// loading new library contents
			controls.library.load();
		});
		
		return false;
	}
	
	$('div.lib > a').live('click', onSelect);
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services);

