////////////////////////////////////////////////////////////////////////////////
// Control Base
//
// 'Abstract' base class for UI controls.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $) {
	controls.control = {
		// properties
		parent: null,
		UI: null,
		
		// constructs control's jQuery object
		getUI: function () {
			throw "Abstract";
		},
		
		// appends control to dom
		// returns the jQuery object it was appended to
		appendTo: function ($parent, parent) {
			this.parent = parent;
			this.UI = this.getUI();
			$parent.append(this.UI);
			return $parent;
		},
		
		// redraws control
		// REMARK: .replaceWith() fails when this.UI doesn't exactly match the actual, visible
		// content of the control, therefore it's strongly advised that it contains just 
		// ONE root jQuery object, unless the this.UI's of parent and child are kept in sync
		redraw: function () {
			if (!this.UI) {
				throw "Only controls that have been added using .appendTo() can be redrawn";
			}
			var UI = this.getUI();
			this.UI.replaceWith(UI);
			this.UI = UI;
			return this;
		}
	};
	
	return controls;
}(controls || {},
	jQuery);
