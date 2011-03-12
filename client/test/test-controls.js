////////////////////////////////////////////////////////////////////////////////
// Unit tests for client controls
////////////////////////////////////////////////////////////////////////////////
var test = function (test, $, controls) {
	test.controls = function () {
		module("Controls");
		
		////////////////////////////////////////////////////////////////////////////////

		test("[control] Exceptions", function () {
			var test_control = Object.create(controls.control);
				
			raises(test_control.getUI, null, "getUI() of base class throws mandatory exception");
			raises(test_control.redraw, null, "Unappended controls can't be redrawn");
		});
		
		test("[control] Appending", function () {
			var test_control = Object.create(controls.control),
					$parent = $('<div />'),
					$child;

			test_control.getUI = function () {
				return $('<div />');
			};
			
			equals(test_control.appendTo($parent), $parent, "appendTo() returns the jQuery parent");
			
			$child = test_control.UI;
			test_control.redraw();
			notEqual(test_control.UI, $child, "Control UI changes after redraw()");
		});
		
		////////////////////////////////////////////////////////////////////////////////

		test("[editable] Exceptions", function () {
			var test_editable = Object.create(controls.editable);
				
			raises(test_editable.edit, null, "edit() of base class throws mandatory exception");
			raises(function () {
				test_editable.appendTo($('<div />'));
			}, null, "Can't append control before overriding display()");
		});
		
		test("[editable] Behavior", function () {
			var test_editable = Object.create(controls.editable),
					mode_before = test_editable.mode,
					$control = $('<div />');

			// mock control
			test_editable.display = function () {
				return controls.editable.display(test_editable, $control);
			};
			test_editable.edit = function () {
				return $('<div />');
			};
			test_editable.appendTo($('<div />'));
			
			test_editable.toggle();
			notEqual(test_editable.mode, mode_before, "Editable mode changes after toggle()");

			test_editable.toggle('display');			
			$control.click();
			notEqual(test_editable.mode, mode_before, "Clicking control in display mode changes mode to edit");
			
			$('body').click();
			equals(test_editable.mode, mode_before, "Clicking outside of edit changes mode back to display");			
		});
	};
	
	return test;
}(test || {},
	jQuery,
	controls);

