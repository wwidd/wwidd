////////////////////////////////////////////////////////////////////////////////
// Library Selector Control
//
// Lists available libraries, with download link
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window, flock */
var app = app || {};

app.controls = function (controls, $, flock, services) {
	controls.libsel = function () {
		var	self = controls.control.create(controls.select()),
				base_contents = self.contents,
				base_onChange = self.onChange,
				base_init = self.init,
				onChange;
		
		//////////////////////////////
		// Initialization

		base_onChange(function (i) {
			var selected = self.options()[i];
			
			services.lib.select(selected, function () {
				// resetting control
				controls.pager.reset();
				controls.search.reset();
				controls.url.set();
	
				// loading new library contents
				controls.media.load();
				
				// calling custom handler
				self.onChange()(i);
			});
		});
		
		services.lib.getall(function (json) {
			var processes = json.data.processes,
					progress = processes.thumbnails.progress,
					options = flock(json).multiget('data.names.*').sort(),
					selected, i;

			indexOf:
			for (i = 0; i < options.length; i++) {
				if (options[i] === json.data.selected) {
					selected = i;
					break indexOf;
				}
			}
			
			// detecting in-progress processes
			if (progress > 0) {
				controls.media
					.poll();
			} else {
				self.render();
			}

			// initializing list
			self
				.options(options)
				.selected(selected)
				.onChange()(selected);			
		});

		//////////////////////////////
		// Getters, setters

		self.onChange = function (value) {
			if (typeof value !== 'undefined') {
				onChange = value;
				return self;
			} else {
				return onChange || function () {};
			}
		};

		//////////////////////////////
		// Overrides

		self.item = function (i, item, selected) {
			return [
				selected ?
					'<span class="caption">' + item + '</span>' :					
					'<a href="#!" class="caption">' + item + '</a>',
				'<a href="#!" class="save" title="' + "Download" + '"></a>'
			].join('');
		};
		
		self.init = function (elem) {
			base_init.call(self, elem);
			
			// decorating class
			elem.addClass('w_libsel');
		};
		
		self.contents = function () {
			return [
				'<iframe class="download" style="display:none;"></iframe>',
				base_contents.call(self)
			].join('');
		};

		return self;
	}();
	
	//////////////////////////////
	// Static event handlers
	
	function onSave(event) {
		var $this = $(this),
				self = controls.lookup[$this.closest('.w_libsel').attr('id')];
		
		// saving library
		services.lib.save(
			self.options()[self.selected()],
			$this.closest('.w_libsel')
				.find('iframe.download'));
		
		return false;
	}
	
	$('div.w_libsel a.save').live('click', onSave);
	
	return controls;
}(app.controls || {},
	jQuery,
	flock,
	app.services);

