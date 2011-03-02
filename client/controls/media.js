////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.media = function (data) {
		var self = Object.create(controls.control);

		// data associated with media file
		self.data = data;
			
		// mandatory control references
		self.checkbox = $('<input type="checkbox"/>');
		self.thumbnail = null;

		// calls playback service			
		self.play = function () {
			self.UI
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.play(self.data.path);
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
				.append($([
					// checkbox
					$('<td />').append(self.checkbox)[0],
					// filename
					$('<td />').append(
						$('<a />', {'href': '#'})
							.text(data.file)
							.click(onClick))[0],
					// rating
					controls.rater(data).appendTo($('<td />'), self)[0],
					// tags
					controls.tagger(data).appendTo($('<td />'), self)[0]
				]));
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

