////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services, data) {
	controls.media = function (row) {
		var self = Object.create(controls.control()),
				rater, tagger;

		self.data.row = row;
				
		//////////////////////////////
		// Business functions

		// calls playback service			
		self.play = function (elem) {
			elem
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.play(row.path);
			data.pagestate.lastPlayed = row.mediaid;
			return self;
		};

		// tells whether this media entry is selected
		self.selected = function () {
			return $('#' + self.id).find(':checked').length > 0;
		};
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.find('a.play')
				.click(onClick);
		};
		
		function build() {
			self.clear();
			rater = controls.rater(row).appendTo(self);
			tagger = controls.tagger(row).appendTo(self);
		}
		
		self.html = function () {
			self.data.that = this;
			
			build();
			
			return [
				'<tr id="', self.id, '" class="media ', data.pagestate.lastPlayed === row.mediaid ? 'playing' : '', '">',
				'<td class="check">',
				'<input type="checkbox" ', row.mediaid in controls.library.selected ? 'checked="checked" ' : '', '/>',
				'</td>',
				'<td class="file">',
				'<a href="#" class="play" title="', row.file, '">', row.file, '</a>',
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

	function onClick() {
		var media = $(this).closest('.media'),
				self = controls.lookup[media.attr('id')].data.that;
		self.play(media);
		return false;
	}
	
	function onChecked() {
		var $this = $(this),
				media = $this.closest('.media'),
				self = controls.lookup[media.attr('id')].data.that;
		if ($this.is(':checked')) {
			controls.library.selected[self.data.row.mediaid] = true;
		} else {
			delete controls.library.selected[self.data.row.mediaid];
		}
	}
	
	$('a.play').live('click', onClick);
	$('td.check :checkbox').live('click', onChecked);
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services,
	yalp.data);

