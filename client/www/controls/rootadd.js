////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = Object.create(controls.control),
				$dirInput = $('<input type="text" />'),
				$addButton = $('<button type="button" />');

		// called when a directory or file is selected
		function onDirTyped() {
			var dir = $(this).val();
			$addButton.attr('disabled', dir.length ? '': 'disabled');
		}
		
		// called on clicking the add button
		function onAdd() {
			services.addroot($dirInput.val(), function () {
				self
					.parent	// page
					.load();
				alert("Folder successfully added to library.");
			});
		}

		// generates jQuery object for control
		self.getUI = function () {
			return $('<div />')
				.append($('<span />')
					.text("Add folder to library: "))
				.append($dirInput
					.change(onDirTyped)
					.keyup(onDirTyped))
				.append($addButton
					.text("Add")
					.attr('disabled', 'disabled')
					.click(onAdd));
		};

		return self;
	}();
	
	return controls;
}(controls || {},
	jQuery,
	services);

