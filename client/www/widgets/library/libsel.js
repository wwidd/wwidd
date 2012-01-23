////////////////////////////////////////////////////////////////////////////////
// Library Selector Control
//
// Lists available libraries, with download link
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith, window, flock, jOrder */
var app = app || {};

app.widgets = function (widgets, $, wraith, flock, jOrder, services) {
	//////////////////////////////
	// Static event handlers

	function onAdd(event, options) {
		var $button = options.elem,
				self = wraith.lookup($(this));
		
		self.select($button.siblings('input.new').val(), function () {
			self.reload();
		});
		
		return false;
	}
	
	//////////////////////////////
	// Static event bindings
	
	$(document)
		.on('buttonClick', '.w_libsel', onAdd);
	
	//////////////////////////////
	// Class
	
	widgets.libsel = function () {
		var	self = wraith.widget.create(widgets.select()),
				button = widgets.button("Add"),
				base_contents = self.contents,
				base_init = self.init;
		
		// selects library and reloads its contents
		// - name: name of the library to select
		self.select = function (name, handler) {
			services.lib.select(name, function () {
				// resetting widget
				widgets.pager.reset();
				widgets.search.reset();
				widgets.url.set();
	
				// loading new library contents
				widgets.media.load();
				
				// setting caption
				widgets.library.dropdown()
					.caption(name)
					.collapse()
					.render();
				
				// calling custom handler
				if (typeof handler === 'function') {
					handler();
				}
			});
		};
		
		// retrieving list of libraries
		self.reload = function () {
			services.lib.getall(function (json) {
				var processes = json.data.processes,
						progress = processes.thumbnails.progress,
						options = flock(json).mget('data.names.*').sort(),
						selected, i;
	
				// preserving library name lookup
				widgets.libsel.data = jOrder.join(options, {});
				
				indexOf:
				for (i = 0; i < options.length; i++) {
					if (options[i] === json.data.selected) {
						selected = i;
						break indexOf;
					}
				}
				
				// detecting in-progress processes
				if (progress > 0) {
					widgets.media
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
				widgets.library.dropdown()
					.caption(self.options()[selected])
					.collapse()
					.render();
			});
		};

		//////////////////////////////
		// Initialization

		// loading library list
		self.reload();
			
		// setting change handler for list
		self.onChange(function (i) {
			self.select(self.options()[i]);
		});
		
		//////////////////////////////
		// Getters, setters

		self.button = function () {
			return button;
		};
		
		//////////////////////////////
		// Overrides

		self.build = function () {
			button
				.disabled({libsel: true})
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
				self = wraith.lookup($this, '.w_libsel');
		
		// saving library
		services.lib.save(
			self.options()[self.selected()],
			$this.closest('.w_libsel')
				.find('iframe.download'));
		
		return false;
	}
	
	function onChange() {
		var $this = $(this),
				self = wraith.lookup($this, '.w_libsel'),
				data = widgets.libsel.data,
				name = $this.val();
				
		// enabling add button
		self.button()
			.disabled({libsel: name.length <= 0 || data.hasOwnProperty(name)})
			.render();
	}
	
	$(document)
		.on('click', '.w_libsel a.save', onSave)
		.on('keyup', '.w_libsel input.new', onChange);
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	flock,
	jOrder,
	app.services);

