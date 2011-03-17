////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	controls.media = function (row) {
		var self = Object.create(controls.base());

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

		//////////////////////////////
		// Event handlers

		function onClick() {
			self.play($(this).closest('.media'));
			return false;
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.find('a')
				.click(onClick);
		};
		
		self.html = function () {
			return [
				'<tr id="', self.id, '" class="media ', data.pagestate.lastPlayed === row.mediaid ? 'playing' : '', '">',
				'<td class="check">', '<input type="checkbox" />', '</td>',
				'<td class="file">',
				'<a href="#" title="', row.file, '">', row.file, '</a>',
				'</td>',
				'<td class="rater">',
				controls.rater(row)
					.appendTo(self)
					.html(),
				'</td>',
				'<td class="tagger">',
				controls.tagger(row)
					.appendTo(self)
					.html(),
				'</td>',
				'</tr>'
			].join('');
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

