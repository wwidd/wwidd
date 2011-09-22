////////////////////////////////////////////////////////////////////////////////
// Video Library
//
// Displays a set of media entries.
// Available views:
// - tile: grid of thumbnails
// - list: list of compact rows
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, document */
var app = app || {};

app.controls = (function (controls, $, data, services) {
	var
	
	// association between library views and entry views
	VIEW_ASSOC = {
		'list': 'compact',
		'tile': 'thumb'
	};
		
	controls.library = function () {
		var self = controls.control.create(),
				view = data.cookie.get('view') || 'list',
				lookup = {};
				
		self.selected = {};
		
		//////////////////////////////
		// Control

		// returns a jQuery object with ALL checkboxes
		function checkboxes() {
			return $('#' + self.id + ' .check > :checkbox');
		}
		
		function media() {
			return $('#' + self.id + ' .medium');
		}
		
		// returns a jQuery object with CHECKED checkboxes
		function checked() {
			return $('#' + self.id + ' .check > :checked');
		}

		// resets registry of selected entries
		self.reset = function () {
			self.selected = {};
			return self;
		};
		
		// selects all elements in visible library
		self.selectAll = function () {
			self.reset();
			checkboxes().attr('checked', 'checked');
			media().each(function () {
				self.selected[controls.lookup[$(this).attr('id')].data.row.mediaid] = true;
			});
			return self;
		};
		
		// deselects all elements in visible library
		self.selectNone = function () {
			self.reset();
			checkboxes().removeAttr('checked', 'checked');
			return self;
		};
				
		// (re-)loads library contents
		self.load = function () {
			var $document = $(document),
					title = $document.attr('title').split(' - ')[0];

			// indicating busy state
			controls.switcher
				.busy(true)
				.render();
			
			// loading video data
			data.media.init(controls.search.filter(), function () {
				// setting active library in page title
				$document.attr('title', title + ' - ' + controls.switcher.selected());
				
				// initializing tag data buffer
				data.tags.init(function () {
					// redrawing controls
					controls.pager
						.render();

					// initializing kinds table
					data.kinds
						.init(data.tags, function () {
							// finalizing library
							controls.library
								.build()
								.render();

							// finalizing kinds
							controls.kinds
								.build()
								.render();
						});
				});

				// removing busy state
				controls.switcher
					.busy(false)
					.render();
			});
			return self;
		};
		
		// sets disabled state of db controls
		function disabled(value) {
			controls.switcher
				.disabled({library: value})
				.render();
			controls.rootadd
				.disabled({library: value})
				.render();
		}
		
		// polls thumbnail generation process
		self.poll = function () {
			// disabling db controls
			disabled(true);
			
			// polling background processes
			services.sys.poll('thumbnails', function (json) {
				// updating progress indicator
				controls.progress
					.progress(json.progress)
					.render();

				// updating media data
				data.media.update(json.load);
				
				// updating thumbnails
				var mediaid, medium;
				for (mediaid in json.load) {
					if (json.load.hasOwnProperty(mediaid) && lookup.hasOwnProperty(mediaid)) {
						medium = lookup[mediaid];
						
						// updating keywords in keywords control
						medium.keywords
							.keywords(json.load[mediaid].keywords)
							.render();
						
						// rendering media entry
						medium.render();
					}
				}
				
				// updating UI if necessary
				if (json.progress === -1) {
					// re-enabling db controls
					disabled(false);
				}
			});
		};
		
		//////////////////////////////
		// Getters / setters

		self.view = function (value) {
			var i, child;
			if (typeof value !== 'undefined') {
				// setting view for library (self)
				view = value;
				
				// setting view for media controls (children)				
				for (i = 0; i < self.children.length; i++) {
					child = self.children[i];
					if (child.view) {
						child.view(VIEW_ASSOC[value]);
					}
				}
				
				return self;
			} else {
				return view;
			}
		};
		
		//////////////////////////////
		// Overrides

		// initiates acquiring of video metadata (keywords, thumbnails, etc.)
		function thumbnails(page) {
			var mediaids = [],
					i, entry;
			
			// collecting entries with no hash
			// only previously processed media entries have hash
			for (i = 0; i < page.length; i++) {
				entry = page[i];
				if (!entry.hash.length) {
					mediaids.push(entry.mediaid);
				}
			}
			
			// calling thumbnail service
			if (mediaids.length) {
				services.media.extract(mediaids.join(','), function () {
					self.poll();
				});
			}
			
			return self;
		}
		
		self.build = function () {
			var page = data.media.getPage(controls.pager.page(), controls.pager.items()),
					i, control;

			// generating thumbnails if necessary
			thumbnails(page);
			
			// attaching new controls to cleaned library
			self.clear();
			lookup = {};
			for (i = 0; i < page.length; i++) {
				// adding media control to library
				control = controls.media(page[i])
					.view(VIEW_ASSOC[view]);
				control.appendTo(self);
				
				// storing control reference for lookup by id
				lookup[page[i].mediaid] = control;
			}
			
			return self;
		};

		self.html = function () {
			var result, i;
			if (self.children.length) {
				result = ['<div id="', self.id, '" class="', ['media', view].join(' '), '">'];
				for (i = 0; i < self.children.length; i++) {
					result.push(self.children[i].html());
				}
				result.push('</div>');
			} else if (controls.search.filter().length) {
				result = ['<span id="', self.id, '" class="warning nohits">', "No videos are matching the criteria.", '</span>'];
			} else {
				result = ['<span id="', self.id, '" class="warning empty">', "This library is empty. Import a folder above with [+].", '</span>'];
			}
			return result.join('');
		};

		return self;
	}();
	
	return controls;
})(app.controls || {},
	jQuery,
	app.data,
	app.services);

