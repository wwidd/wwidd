////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, services, data) {
	var
	
	// static event handlers
	onEnter,
	onLeave,
	onClick,
	onChecked;
	
	controls.media = function (row, view) {
		var self = controls.control.create(),
		
		// sub-controls
		rater,
		tagger;
		
		self.data.row = row;

		//////////////////////////////
		// Getters / setters

		self.view = function () {
			return view;
		};
		
		//////////////////////////////
		// Business functions

		// calls playback service			
		self.play = function (elem) {
			elem
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.play(row.mediaid);
			data.pagestate.lastPlayed = row.mediaid;
			return self;
		};

		// tells whether this media entry is selected
		self.selected = function () {
			return $('#' + self.id).find(':checked').length > 0;
		};
		
		//////////////////////////////
		// Overrides

		function build() {
			self.clear();
			rater = controls.rater(row).appendTo(self);
			if (view === 'list') {
				tagger = controls.tagger(row).appendTo(self);
			}
		}
		
		self.html = function () {
			build();
			
			var parent, child,
					hash = row.hash;

			// containers for html tag names
			if (view === 'list') {
				parent = 'tr';
				child = 'td';
			} else {
				parent = 'div';
				child = 'div';
			}
			
			return [
				'<', parent, ' id="', self.id, '" class="', ['medium'].concat(data.pagestate.lastPlayed === row.mediaid ? ['playing'] : []).join(' '), '">',
				'<', child, ' class="check">',
				'<input type="checkbox" ', row.mediaid in controls.library.selected ? 'checked="checked" ' : '', '/>',
				'</', child, '>',
				view === 'tile' ? [
					'<div class="file">',
					'<span>', row.file, '</span>',
					'</div>',
					'<div class="overlay"></div>',
					'<div class="thumb">',
					hash.length ? ['<img class="play" src="/cache/', hash, '.jpg">'].join('') : '',
					'</div>'
				].join('') : [
					'<td class="file">',
					'<a href="#" class="play">', row.file, '</a>',
					'</td>'
				].join(''),
				'<', child, ' class="rater">',
				rater.html(),
				'</', child, '>',
				view === 'list' ? [
					'<', child, ' class="tagger">',
					tagger.html(),
					'</', child, '>'
				].join('') : '',
				'</', parent, '>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers
	
	onEnter = function (event) {
		var media = $(this).closest('.medium'),
				self = controls.lookup[media.attr('id')],
				view = self.view();
		if (self.data.row.keywords.length || view === 'list' && self.data.row.hash.length) {
			controls.preview
				.keywords(self.data.row.keywords)
				.hash(view === 'list' ? self.data.row.hash : '')
				.render($('body'));
		}
	};
	
	onLeave = function (event) {
		controls.preview
			.remove()
			.render();
	};
	
	onClick = function () {
		var media = $(this).closest('.medium'),
				self = controls.lookup[media.attr('id')];
		self.play(media);
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
	
	$('a.play, img.play')
		.live('click', onClick)
		.live('mouseenter', onEnter)
		.live('mouseleave', onLeave);
	$('td.check :checkbox').live('click', onChecked);
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services,
	app.data);

