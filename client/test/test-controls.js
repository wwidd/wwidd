////////////////////////////////////////////////////////////////////////////////
// Unit tests for client controls
////////////////////////////////////////////////////////////////////////////////
var test = function (test, $, controls) {
	test.controls = function () {
		module("Controls");
		
		////////////////////////////////////////////////////////////////////////////////
		
		test("[control] Appending", function () {
			var test_control = Object.create(controls.control()),
					$parent = $('<div />'),
					$child, $ui;

			test_control.html = function () {
				return '<div />';
			};
			
			equals(test_control.render($parent), $parent, "render() returns the jQuery parent");

			$child = $parent.children()[0];
			$ui = test_control.render()[0];
			notEqual($ui, $child, "Control UI changes after render()");
		});
		
		////////////////////////////////////////////////////////////////////////////////

		test("[editable] Exceptions", function () {
			var test_editable = Object.create(controls.editable());
				
			raises(test_editable.edit, null, "edit() of base class throws mandatory exception");
			raises(function () {
				test_editable.render($('<div />'));
			}, null, "Can't render control before overriding display()");
		});
		
		test("[editable] Behavior", function () {
			var base_editable = controls.editable(),
					test_editable = Object.create(base_editable),
					mode_before = test_editable.mode,
					$control;

			// mock control
			test_editable.display = function () {
				return '<span id="' + test_editable.id + '" class="editable">A</span>';
			};
			test_editable.edit = function () {
				return '<input id="' + test_editable.id + '" type="text" />';
			};
			test_editable.render($('<div />'));
			
			// test 1.
			test_editable.toggle();
			notEqual(test_editable.mode, mode_before, "Editable mode changes after toggle()");

			// test 2.
			$control = test_editable.toggle('display');
			$control.click();
			notEqual(test_editable.mode, mode_before, "Clicking control in display mode changes mode to edit");
			
			// test 3.
			$('body').click();
			equals(test_editable.mode, mode_before, "Clicking outside of edit changes mode back to display");			
		});

		////////////////////////////////////////////////////////////////////////////////
		// controls.kind is tricky, because we need to test if clicking on the:
		// checkbox, label and anywhere else on the control triggers the same event
		
		test("[kind] Clicking parts of the control", function () {
			var test_kind = controls.kind({kind: "test"}, function () {
				ok(true, "Click handler triggered");
			}),
						
			$parent = test_kind.render($('<div />'));

			expect(2);
			$parent.children()
				.click()
				.find(':checkbox').click();
		});

		test("[kind] Checked state", function () {
			var before_checked,
					after_checked,
					
			test_kind = controls.kind({kind: "test"}),
			
			$parent = test_kind.render($('<div />'));

			before_checked = $parent.find(':checkbox').is(':checked');
			$parent.children().click();
			after_checked = $parent.find(':checkbox').is(':checked');
			
			notEqual(after_checked, before_checked, "Checked state changes after clicking the control");
			before_checked = after_checked;
			$parent.children().click();
			after_checked = $parent.find(':checkbox').is(':checked');

			notEqual(after_checked, before_checked, "Checked state changes back after clicking again");
		});
	};
	
	return test;
}(test || {},
	jQuery,
	controls);

