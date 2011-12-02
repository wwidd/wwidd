////////////////////////////////////////////////////////////////////////////////
// Video Library
//
// Displays a set of media entries.
// Available views:
// - tile: grid of thumbnails
// - list: list of compact rows
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, document */
var app = app || {};

app.widgets = (function (widgets, $, wraith, model, services) {
	var
	
	// association between library views and entry views
	VIEW_ASSOC = {
		'list': 'compact',
		'tile': 'thumb'
	};
		
	widgets.media = function () {
		var self = wraith.widget.create(),
				view = model.cookie.get('view') || 'list',
				lookup = {},
				onChange;
				
		self.selected = {};
		
		//////////////////////////////
		// Getters, setters
		
		self.onChange = function (value) {
			if (typeof value === 'function') {
				onChange = value;
				return self;
			} else if (typeof onChange === 'function') {
				return onChange();
			} else {
				return onChange;
			}
		};

		//////////////////////////////
		// Control

		// returns a jQuery object with ALL checkboxes
		function checkboxes() {
			return $('#' + self.id + ' .check > :checkbox');
		}
		
		function media() {
			return $('#' + self.id + ' .w_medium');
		}
		
		// returns a jQuery object with CHECKED checkboxes
		function checked() {
			return $('#' + self.id + ' .check > :checked');
		}

		// resets registry of selected entries
		function resetSelected() {
			self.selected = {};
		}
		
		// resets media state
		self.reset = function () {
			// emptying registry of selected entries
			resetSelected();
			
			// re-setting common medium state
			widgets.medium.reset();
			
			return self;
		};
		
		// selects all elements in visible library
		self.selectAll = function () {
			resetSelected();
			checkboxes().prop('checked', true);
			media().each(function () {
				var medium = wraith.lookup($(this));
				self.selected[medium.data.mediaid] = true;
			});
			return self;
		};
		
		// deselects all elements in visible library
		self.selectNone = function () {
			resetSelected();
			checkboxes().removeAttr('checked', 'checked');
			return self;
		};
		
		// redraws tags and kinds only
		self.refreshTags = function () {
			// finalizing kinds
			widgets.kinds
				.build()
				.render();
				
			widgets.tagger
				.render();

			if (typeof onChange === 'function') {
				onChange();
			}
		};
		
		self.refresh = function () {
			// indicating busy state
			widgets.library
				.busy(true)
				.render();

			// redrawing widgets
			widgets.pager
				.render();

			// finalizing library
			widgets.media
				.reset()
				.build()
				.render();

			// finalizing kinds
			widgets.kinds
				.build()
				.render();
				
			// redrawing checker
			widgets.checker
				.render();

			// removing busy state
			widgets.library
				.busy(false)
				.render();
				
			if (typeof onChange === 'function') {
				onChange();
			}
		};
		
		// (re-)loads library contents
		self.load = function () {
			var $document = $(document),
					title = $document.attr('title').split(' - ')[0];

			// indicating busy state
			widgets.library
				.busy(true)
				.render();
			
			// loading video data
			model.media.init(function () {
				// setting active library in page title
				$document.attr('title', title + ' - ' + widgets.library.name());
				model.media.filter(widgets.search.filter());
				self.refresh();
			});
			return self;
		};
		
		// sets disabled state of db widgets
		function disabled(value) {
			widgets.library
				.disabled({library: value})
				.render();
			widgets.rootadd
				.disabled({library: value})
				.render();
		}
		
		// polls thumbnail generation process
		self.poll = function () {
			// disabling db widgets
			disabled(true);
			
			// polling background processes
			services.sys.poll('thumbnails', function (json) {
				// updating progress indicator
				widgets.progress
					.progress(json.progress)
					.render();

				// updating media data
				model.media.update(json.load);
				
				// updating thumbnails
				var mediaid, medium;
				for (mediaid in json.load) {
					if (json.load.hasOwnProperty(mediaid) && lookup.hasOwnProperty(mediaid)) {
						// looking up widget
						medium = lookup[mediaid];
						
						// rendering media entry
						medium.render();
					}
				}
				
				// updating UI if necessary
				if (json.progress === -1) {
					// re-enabling db widgets
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
				
				// setting view for media widgets (children)				
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
				services.media.extract(mediaids.join(','), false, function () {
					self.poll();
				});
			}
			
			return self;
		}
		
		self.build = function () {
			var page = model.media.getPage(widgets.pager.page(), widgets.pager.items()),
					i, control;

			// generating thumbnails if necessary
			thumbnails(page);
			
			// attaching new widgets to cleaned library
			self.clear();
			lookup = {};
			for (i = 0; i < page.length; i++) {
				// adding media widget to library
				control = widgets.medium(page[i].mediaid)
					.view(VIEW_ASSOC[view]);
				control.appendTo(self);
				
				// storing widget reference for lookup by id
				lookup[page[i].mediaid] = control;
			}
			
			return self;
		};

		self.init = function () {
			if (typeof onChange === 'function') {
				onChange();
			}
		};
		
		self.html = function () {
			var result, i;
			if (self.children.length) {
				result = ['<div id="', self.id, '" class="', ['w_media', view].join(' '), '">'];
				for (i = 0; i < self.children.length; i++) {
					result.push(self.children[i].html());
				}
				result.push('</div>');
			} else if (widgets.search.filter().length) {
				result = [
					'<span id="', self.id, '" class="warning nohits">',
					'<span class="icon"></span>',
					'<span>', "No videos match the criteria.", '</span>',
					'</span>'
				];
			} else {
				result = [
					'<span id="', self.id, '" class="warning empty">',
					'<span>', "This library is empty. Import a folder above with [+].", '</span>',
					'<span class="icon"></span>',
					'</span>'
				];
			}
			return result.join('');
		};

		return self;
	}();
	
	return widgets;
})(app.widgets || {},
	jQuery,
	wraith,
	app.model,
	app.services);

