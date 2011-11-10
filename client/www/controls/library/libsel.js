////////////////////////////////////////////////////////////////////////////////
// Library Selector Control
//
// Lists available libraries, with download link
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window, flock, jOrder */
var app = app || {};

app.controls = function (controls, $, flock, jOrder, services) {
	controls.libsel = function () {
		var	self = controls.control.create(controls.select()),
				button = controls.button("Add"),
				base_contents = self.contents,
				base_init = self.init;
		
		// selects library and reloads its contents
		// - name: name of the library to select
		function select(name, handler) {
			services.lib.select(name, function () {
				// resetting control
				controls.pager.reset();
				controls.search.reset();
				controls.url.set();
	
				// loading new library contents
				controls.media.load();
				
				// setting caption
				controls.library.dropdown()
					.caption(name)
					.collapse()
					.render();
				
				// calling custom handler
				if (typeof handler === 'function') {
					handler();
				}
			});
		}
		
		// retrieving list of libraries
		function reload() {
			services.lib.getall(function (json) {
				var processes = json.data.processes,
						progress = processes.thumbnails.progress,
						options = flock(json).mget('data.names.*').sort(),
						selected, i;
	
				// preserving library name lookup
				controls.libsel.data = jOrder.join(options, {});
				
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
	
				// adding placeholder for new library
				options.push(null);
				
				// initializing list
				self
					.options(options)
					.selected(selected);
					
				// setting caption
				controls.library.dropdown()
					.caption(self.options()[selected])
					.collapse()
					.render();
			});
		}

		//////////////////////////////
		// Initialization

		// loading library list
		reload();
			
		// setting change handler for list
		self.onChange(function (i) {
			select(self.options()[i]);
		});
		
		//////////////////////////////
		// Getters, setters

		self.button = function () {
			return button;
		};
		
		//////////////////////////////
		// Overrides

		// called on adding a new library
		function onAdd() {
			select($(this).siblings('input.new').val(), function () {
				reload();
			});
		}
		
		self.build = function () {
			button
				.disabled({libsel: true})
				.onClick(onAdd)
				.appendTo(self);
		
			return self;
		};
		
		self.item = function (i, item, selected) {
			if (item) {
				return [
					selected ?
						'<span class="caption">' + item + '</span>' :					
						'<a href="#!" class="caption">' + item + '</a>',
					'<a href="#!" class="save" title="' + "Download" + '"></a>'
				].join('');
			} else {
				return [
					'<input type="text" class="new" />',
					button.html()
				].join('');
			}
		};
		
		self.init = function (elem) {
			base_init.call(self, elem);
			
			// decorating class
			elem
				.addClass('w_libsel')
				.find('input.new').closest('li')
					.addClass('new');
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
	
	function onChange() {
		var $this = $(this),
				self = controls.lookup[$this.closest('.w_libsel').attr('id')],
				data = controls.libsel.data,
				name = $this.val();
				
		// enabling add button
		self.button()
			.disabled({libsel: name.length <= 0 || data.hasOwnProperty(name)})
			.render();
	}
	
	var context = $('div.w_libsel');
	$('a.save', context).live('click', onSave);
	$('input.new', context).live('keyup', onChange);
	
	return controls;
}(app.controls || {},
	jQuery,
	flock,
	jOrder,
	app.services);

