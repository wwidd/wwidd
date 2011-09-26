////////////////////////////////////////////////////////////////////////////////
// Media Entry
//
// Single video entry.
// Available views:
// - compact: checkbox, filename, rater, and tagger controls as a row
// - thumb: checker, thumbnail, filename, and rater overlayed
// - expanded: all controls (checkbox, thumbnail, filename, rater, keywords, tagger)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $, services, data) {
	var
	
	VIEWS = {
		'thumb': 'thumb',
		'compact': 'compact',
		'expanded': 'expanded'
	},
	
	// static properties
	lastWidth,			// last measured available width for compact view media entry
	lastOpen,				// control reference to the last opened medium (thumb or compact to expanded)
	
	// static event handlers
	onClick,
	onChecked,
	onResize;
	
	controls.medium = function (row) {
		var self = controls.control.create(),
		
		// flags
		view = 'thumb',
		expanded = null;
		
		self.data.row = row;

		// sub-controls
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
			services.media.play(row.mediaid);
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
		self.build = function () {
			self.clear();
			
			// adding rater control
			self.rater = controls.rater(row.mediaid)
				.appendTo(self);
			
			// adding tagger control to non-thumb views
			self.tagger = controls.tagger(row.mediaid)
				.appendTo(self);
			
			// adding keywords control
			self.keywords = controls.keywords(row.mediaid)
				.appendTo(self);
			
			return self;
		};
		
		self.init = function (elem) {
			controls.medium.resize(true, elem);
		};
		
		self.html = function () {
			var parent, child,
					hash = row.hash;

			return [
				'<div id="', self.id, '" class="', 
				['medium']
					.concat(data.pagestate.lastPlayed === row.mediaid ? ['playing'] : [])
					.concat(VIEWS[expanded || view] || [])
					.join(' '), '">',
					
				// checkbox
				'<div class="check">',
				'<input type="checkbox" ', row.mediaid in controls.media.selected ? 'checked="checked" ' : '', '/>',
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
					hash.length ?
						['<img src="/cache/', hash, '.jpg">'].join('') :
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
	
	// resizes tagger 'column' to fit screen width
	controls.medium.resize = function (force, elem) {
		var $list = elem || $('div.media.list'),
				width, full = $list.width(),
				$media, $model, $tagger,
				left;

		if (force || (!lastWidth || full !== lastWidth) && $list.length) {
			$media = elem || $list.children('div.medium');
			$tagger = $media.find('div.tagger');

			if ($tagger.length) {
				// obtaining single tagger for measurement
				$model = $media.eq(0).find('div.tagger');
				
				if ($model.css('position') === 'absolute') {
					// tagger absolutely positioned
					left = $model.position().left;
				} else if ($model.css('display') === 'inline-block') {
					// tagger is inline-block
					// measuring padding + border + margin + scroller
					left = $model.outerWidth(true) - $model.width() + 15;
					
					// counting all previous siblings' width
					$model.prevAll()
						.each(function () {
							left += $(this).outerWidth(true);
						});
				} else {
					// failsafe
					// will look ugly
					left = full;
				}
				
				// setting updated width
				$tagger.width(full - left);

				// updating state indicator
				lastWidth = full;
			}			
		}
	};
	
	//////////////////////////////
	// Static event handlers
	
	onClick = function () {
		var media = $(this).closest('.medium'),
				self = controls.lookup[media.attr('id')],
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
			
			// flipping full state and re-rendering control
			self
				.expanded(!expanded)
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
			controls.media.selected[self.data.row.mediaid] = true;
		} else {
			delete controls.media.selected[self.data.row.mediaid];
		}
	};
	
	onResize = function (elem) {
		controls.medium.resize();
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

