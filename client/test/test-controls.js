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
	};
	
	return test;
}(test || {},
	jQuery,
	controls);

