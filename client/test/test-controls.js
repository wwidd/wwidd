////////////////////////////////////////////////////////////////////////////////
// Unit tests for client controls
////////////////////////////////////////////////////////////////////////////////
/*global app, jQuery, document, module, ok, equal, equals, deepEqual, notEqual, raises, expect */
var test = function (test, $, controls) {
	// counts number of controls in lookup
	function count_controls() {
		var count = 0,
				id;
		for (id in controls.lookup) {
			if (controls.lookup.hasOwnProperty(id)) {
				count++;
			}
		}
		return count;
	}

	test.controls = function () {
		module("Controls");
		
		////////////////////////////////////////////////////////////////////////////////
		
		test("[control] Appending", function () {
			var count_before = count_controls(),
					test_control = Object.create(controls.control()),
					count_after = count_controls(),
					$parent = $('<div />'),
					$child, $ui;

			equals(count_before + 1, count_after, "control count increments after adding control");
					
			test_control.html = function () {
				return '<div />';
			};
			
			equals(test_control.render($parent), $parent, "render() returns theuery parent");

			$child = $parent.children()[0];
			$ui = test_control.render()[0];
			notEqual($ui, $child, "Control UI changes after render()");
		});
		
		test("[control] Clearing", function () {
			var count_before = count_controls(),
					test_control = controls.control(),
					count_after,
					i;
			
			for (i = 0; i < 10; i++) {
				test_control.append(controls.control());
			}
			
			count_after = count_controls();
			
			equals(count_after - count_before, 11, "Addition of 11 controls registered");
			equals(count_controls(), controls.count(), "controls.count() is in sync with acual number of controls after change");
			
			// removing first child control
			test_control.children[0].remove();
			equals(count_controls(), count_after - 1, "Single control unlinked from lookup table on removal");
			equals(count_controls(), controls.count(), "controls.count() is in sync with acual number of controls after change");
			
			// clearing remaining child controls
			test_control.clear();
			equals(count_controls(), count_before + 1, "Multiple controls unlinked from lookup on clearing control");
			equals(count_controls(), controls.count(), "controls.count() is in sync with acual number of controls after change");
			
			// removing main control
			test_control.remove();
			equals(count_controls(), count_before, "Parent control unlinked from lookup on removal");
			equals(count_controls(), controls.count(), "controls.count() is in sync with acual number of controls after change");
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
	app.controls);

