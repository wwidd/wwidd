////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services, data) {
	var
	
	// static event handlers
	onEnter,
	onLeave,
	onClick,
	onChecked;
	
	controls.media = function (row) {
		var self = controls.control.create(),
		
		// sub-controls
		rater,
		tagger;
		
		self.data.row = row;
		
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
			tagger = controls.tagger(row).appendTo(self);
		}
		
		self.html = function () {
			build();
			
			return [
				'<tr id="', self.id, '" class="media ', data.pagestate.lastPlayed === row.mediaid ? 'playing' : '', '">',
				'<td class="check">',
				'<input type="checkbox" ', row.mediaid in controls.library.selected ? 'checked="checked" ' : '', '/>',
				'</td>',
				'<td class="file">',
				'<a href="#" class="play">', row.file, '</a>',
				'</td>',
				'<td class="rater">',
				rater.html(),
				'</td>',
				'<td class="tagger">',
				tagger.html(),
				'</td>',
				'</tr>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers
	
	onEnter = function (event) {
		var media = $(this).closest('.media'),
				self = controls.lookup[media.attr('id')];
		if (self.data.row.keywords.length || self.data.row.hash.length) {
			controls.preview
				.keywords(self.data.row.keywords)
				.hash(self.data.row.hash)
				.render($('body'));
		}
	};
	
	onLeave = function (event) {
		controls.preview
			.remove()
			.render();
	};
	
	onClick = function () {
		var media = $(this).closest('.media'),
				self = controls.lookup[media.attr('id')];
		self.play(media);
		return false;
	};
	
	onChecked = function () {
		var $this = $(this),
				media = $this.closest('.media'),
				self = controls.lookup[media.attr('id')];
		if ($this.is(':checked')) {
			controls.library.selected[self.data.row.mediaid] = true;
		} else {
			delete controls.library.selected[self.data.row.mediaid];
		}
	};
	
	$('a.play')
		.live('click', onClick)
		.live('mouseenter', onEnter)
		.live('mouseleave', onLeave);
	$('td.check :checkbox').live('click', onChecked);
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services,
	yalp.data);

