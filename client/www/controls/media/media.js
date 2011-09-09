////////////////////////////////////////////////////////////////////////////////
// Media Entry
//
// Single video entry.
// Available views:
// - compact: checkbox, filename, rater, and tagger controls as a row
// - thumb: checker, thumbnail, filename, and rater overlayed
// - full: all controls (checkbox, thumbnail, filename, rater, keywords, tagger)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $, services, data) {
	var
	
	VIEWS = {
		'thumb': 'thumb',
		'compact': 'compact',
		'full': 'full'
	},
	
	// static properties
	lastWidth,			// last measured available width for compact view media entry
	lastOpen,				// control reference to the last opened medium (thumb or compact to full)
	
	// static event handlers
	onClick,
	onChecked,
	onResize;
	
	controls.media = function (row, view) {
		var self = controls.control.create(),
		
		// sub-controls
		rater,
		tagger,
		keywords,
		
		// flags
		full = null;
		
		self.data.row = row;

		//////////////////////////////
		// Getters / setters

		self.view = function () {
			return view;
		};
		
		// true or false
		self.full = function (value) {
			if (typeof value !== 'undefined') {
				full = value ? 'full' : null;
				return self;
			} else {
				return full ? true : false;
			}
		};
		
		//////////////////////////////
		// Business functions

		// calls playback service			
		self.play = function (elem) {
			elem
				.siblings().removeClass('playing').end()
				.addClass('playing');
			//services.play(row.mediaid);
			data.pagestate.lastPlayed = row.mediaid;
			return self;
		};

		// tells whether this media entry is selected
		self.selected = function () {
			return $('#' + self.id).find(':checked').length > 0;
		};
		
		//////////////////////////////
		// Overrides

		// builds control structure
		// TODO: controls need be added once, or, when views change
		function build() {
			self.clear();
			
			// adding rater control
			rater = controls.rater(row).appendTo(self);
			
			// adding tagger control to non-thumb views
			if (full || view === 'compact') {
				tagger = controls.tagger(row).appendTo(self);
			}
			
			// adding keywords control to full view only
			if (full) {
				keywords = controls.keywords(row.keywords).appendTo(self);
			}
		}
		
		self.init = function (elem) {
			controls.media.resize(true, elem);
		};
		
		self.html = function () {
			build();
			
			var parent, child,
					hash = row.hash;

			return [
				'<div id="', self.id, '" class="', 
				['medium']
					.concat(data.pagestate.lastPlayed === row.mediaid ? ['playing'] : [])
					.concat(VIEWS[full || view] || [])
					.join(' '), '">',
					
				// checkbox
				'<div class="check">',
				'<input type="checkbox" ', row.mediaid in controls.library.selected ? 'checked="checked" ' : '', '/>',
				'</div>',
				
				// file name
				'<div class="file">',
				'<span title="', row.file, '">', row.file, '</span>',
				'</div>',
				
				// thumbnail
				full || view === 'thumb' ? [
					'<div class="overlay"></div>',
					'<div class="play"></div>',
					'<div class="thumb">',
					hash.length ?
						['<img src="/cache/', hash, '.jpg">'].join('') :
						'<span class="spinner"></span>',
					'</div>'
				].join('') : '',
				
				// rater
				rater.html(),
				
				// keywords
				full ? keywords.html() : '',
				
				// tagger
				full || view === 'compact' ? tagger.html() : '',
				
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static methods
	
	// resizes tagger 'column' to fit screen width
	controls.media.resize = function (force, elem) {
		var $list = elem || $('div.media.list'),
				widths = {full: $list.width()},
				$media, $model;
		if (force || (!lastWidth || widths.full !== lastWidth) && $list.length) {
			// obtaining DOM elements
			$media = elem || $list.children('div.medium');
			$model = $media.eq(0);
			
			// measuring fix widths that influence variable width
			widths.check = $model.children('div.check').outerWidth(true);
			widths.file = $model.children('div.file').outerWidth(true);
			widths.rater = $model.children('div.rater').outerWidth(true);
			widths.margin = $model.children('div.tagger').outerWidth(true) - $model.children('div.tagger').width();
			widths.scroller = 15;	// scroller may appear without triggering a resize event
			
			// changing width
			$media.find('div.tagger').width(
				widths.full -
				widths.check -
				widths.file -
				widths.rater -
				widths.margin -
				widths.scroller);
			
			// updating state indicator
			lastWidth = widths.full;
		}
	};
	
	//////////////////////////////
	// Static event handlers
	
	onClick = function () {
		var media = $(this).closest('.medium'),
				self = controls.lookup[media.attr('id')],
				full = self.full();

		if (full) {
			// starting playback
			self.play(media);
		} else {
			// closing last opened entry
			if (lastOpen) {
				lastOpen
					.full(false)
					.render();
				lastOpen = null;
			}
			
			// flipping full state and re-rendering control
			self
				.full(!full)
				.render();
				
			// saving reference to last opened entry
			lastOpen = self;
		}
			
		return false;
	};
	
	onChecked = function () {
		var $this = $(this),
				media = $this.closest('.medium'),
				self = controls.lookup[media.attr('id')];
		if ($this.is(':checked')) {
			controls.library.selected[self.data.row.mediaid] = true;
		} else {
			delete controls.library.selected[self.data.row.mediaid];
		}
	};
	
	onResize = function (elem) {
		controls.media.resize();
	};
	
	//////////////////////////////
	// Event bindings

	$('div.thumb, div.file, div.play', $('div.medium'))
		.live('click', onClick);
	$('div.check > :checkbox')
		.live('click', onChecked);
	$(window)
		.bind('resize', onResize);
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services,
	app.data);

