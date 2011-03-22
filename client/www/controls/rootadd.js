////////////////////////////////////////////////////////////////////////////////
// Root Adder Control
////////////////////////////////////////////////////////////////////////////////
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	controls.rootadd = function () {
		var self = Object.create(controls.control());

		//////////////////////////////
		// Initialization

		// called when a directory or file is selected
		function onDirTyped() {
			var $this = $(this);
			$this.siblings('button').attr('disabled', $this.val().length ? null : 'disabled');
		}
		
		// called on clicking the add button
		function onAdd() {
			var $this = $(this);
			services.addroot($this.siblings('input').val(), function () {
				controls.library.load();
				$this.siblings('input').val(null);
				alert("Folder successfully added to library.");
			});
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.find('input')
					.change(onDirTyped)
					.keyup(onDirTyped)
				.end()
				.find('button')
					.click(onAdd)
				.end();
		};
		
		self.html = function () {
			return [
				'<div id="', self.id, '">',
				'<span>', "Add folder to library:", '</span>',
				'<input type="text">',
				'<button type="button" disabled="disabled">', "Add", '</button>',
				'</div>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services);

