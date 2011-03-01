////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, control, rater, tagger) {
	controls.media = function (data) {
		var self = Object.create(control);

		// data associated with media file
		self.data = data;
			
		// mandatory control references
		self.checkbox = $('<input type="checkbox"/>');
		self.thumbnail = null;

		// calls playback service			
		self.play = function () {
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
			return $('<tr />')
				.append($([
					// checkbox
					$('<td />').append(self.checkbox)[0],
					// filename
					$('<td />').append(
						$('<a />', {'href': '#'})
							.text(data.file)
							.click(onClick))[0],
					// rating
					rater(data).appendTo($('<td />'), self)[0],
					// tags
					tagger(data).appendTo($('<td />'), self)[0]
				]));
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	controls.control,
	controls.rater,
	controls.tagger);

