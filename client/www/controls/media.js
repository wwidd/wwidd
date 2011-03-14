////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	controls.media = function (row) {
		var self = Object.create(controls.control);

		// data associated with media file
		self.data = row;
			
		// mandatory control references
		self.checkbox = $('<input type="checkbox"/>');
		self.thumbnail = null;

		// calls playback service			
		self.play = function () {
			self.UI
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.play(self.data.path);
			data.pagestate.lastPlayed = self.data.mediaid;
			return self;
		};
		
		// selects entry
		self.select = function () {
			self.checkbox.attr('checked', 'checked');
			return self;
		};
		
		// deselects entry
		self.deselect = function () {
			self.checkbox.removeAttr('checked');
			return self;
		};
		
		// draws entry
		self.getUI = function () {
			// click handler
			function onClick() {
				self.play();
				return false;
			}
			
			// constructing UI
			return $('<tr />', {'class': 'media'})
				// checkbox
				.append($('<td />', {'class': 'check'}).append(self.checkbox))
				// filename
				.append($('<td />', {'class': 'file'})
					.append($('<a />', {'href': '#', 'title': row.file})
						.text(row.file)
						.click(onClick)))
				// rating
				.append(controls.rater(row).appendTo($('<td />', {'class': 'rater'}), self))
				// tags
				.append(controls.tagger(row).appendTo($('<td />', {'class': 'tagger'}), self))
				.addClass(data.pagestate.lastPlayed === self.data.mediaid ? 'playing' : null);
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

