////////////////////////////////////////////////////////////////////////////////
// Media Entry
//
// Single video entry.
// Available views:
// - compact: checkbox, filename, rater, and tagger widgets as a row
// - thumb: checker, thumbnail, filename, and rater overlayed
// - expanded: all widgets (checkbox, thumbnail, filename, rater, keywords, tagger)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, window */
var app = app || {};

app.widgets = function (widgets, $, wraith, services, model) {
	var
	
	VIEWS = {
		'thumb': 'thumb',
		'compact': 'compact',
		'expanded': 'expanded'
	},
	
	// static properties
	lastOpen,				// widget reference to the last opened medium (thumb or compact to expanded)
	
	// static event handlers
	onClick,
	onChecked,
	onResize;
	
	widgets.medium = function (mediaid) {
		var self = wraith.widget.create(),
		
		// flags
		view = 'thumb',
		expanded = null;
		
		self.data.mediaid = mediaid;

		// child widgets
		self.rater = null;
		self.tagger = null;
		self.keywords = null;
		
		//////////////////////////////
		// Getters / setters

		self.view = function (value) {
			if (typeof value !== 'undefined') {
				view = value;
				return self;
			} else {
				return view;
			}
		};
		
		// true or false
		self.expanded = function (value) {
			if (typeof value !== 'undefined') {
				expanded = value ? 'expanded' : null;
				return self;
			} else {
				return expanded ? true : false;
			}
		};
		
		//////////////////////////////
		// Business functions

		// calls playback service			
		self.play = function (elem) {
			elem
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.media.play(mediaid);
			model.pagestate.lastPlayed = mediaid;
			return self;
		};

		// tells whether this media entry is selected
		self.selected = function () {
			return $('#' + self.id).find(':checked').length > 0;
		};
		
		//////////////////////////////
		// Overrides

		// builds widget structure
		self.build = function () {
			self.clear();
			
			// adding rater widget
			self.rater = widgets.rater(mediaid)
				.appendTo(self);
			
			// adding tagger widget to non-thumb views
			self.tagger = widgets.tagger(mediaid)
				.appendTo(self);
			
			// adding keywords widget
			self.keywords = widgets.keywords(mediaid)
				.appendTo(self);
			
			return self;
		};
		
		self.html = function () {
			var parent, child,
					row = model.media.getRow(mediaid);

			return [
				'<div id="', self.id, '" class="', 
				['medium']
					.concat(model.pagestate.lastPlayed === mediaid ? ['playing'] : [])
					.concat(VIEWS[expanded || view] || [])
					.join(' '), '">',
					
				// checkbox
				'<div class="check">',
				'<input type="checkbox" ', mediaid in widgets.media.selected ? 'checked="checked" ' : '', '/>',
				'</div>',
				
				// file name
				'<div class="file">',
				'<span title="', row.file, '">', row.file, '</span>',
				'</div>',
				
				// thumbnail
				expanded || view === 'thumb' ? [
					'<div class="overlay"></div>',
					'<div class="play"><div class="image"></div></div>',
					'<div class="thumb">',
					row.hash.length ?
						['<img src="/cache/', row.hash, '.jpg">'].join('') :
						'<span class="spinner"></span>',
					'</div>'
				].join('') : '',
				
				// rater
				self.rater.html(),
				
				// keywords
				expanded ? self.keywords
					.compact(view !== 'compact')
					.html() : '',
				
				// tagger
				expanded || view === 'compact' ? self.tagger.html() : '',
				
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static methods
	
	// resets medium memory
	widgets.medium.reset = function () {
		lastOpen = null;
	};

	//////////////////////////////
	// Static event handlers
	
	onClick = function () {
		var media = $(this).closest('.medium'),
				self = wraith.lookup(media),
				expanded = self.expanded();

		if (expanded) {
			// starting playback
			self.play(media);
		} else {
			// closing last opened entry
			if (lastOpen) {
				lastOpen
					.expanded(false)
					.render();
				lastOpen = null;
			}
			
			// flipping full state and re-rendering widget
			self
				.expanded(!expanded)
				.render();
			
			// notifying media collection of change
			widgets.media
				.onChange();
				
			// saving reference to last opened entry
			lastOpen = self;
		}
			
		return false;
	};
	
	onChecked = function () {
		var $this = $(this),
				$medium = $this.closest('.medium'),
				self = wraith.lookup($medium);
		
		// registering (un)checked item
		if ($this.is(':checked')) {
			widgets.media.selected[self.data.mediaid] = true;
		} else {
			delete widgets.media.selected[self.data.mediaid];
		}

		// refreshing main checker widget
		widgets.checker.render();
	};
	
	//////////////////////////////
	// Event bindings

	$('div.thumb, div.file, div.play', $('div.medium'))
		.live('click', onClick);
	$('div.check > :checkbox')
		.live('click', onChecked);
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	app.services,
	app.model);

