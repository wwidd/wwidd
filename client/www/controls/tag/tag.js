////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, escape */
var app = app || {};

app.controls = function (controls, $, jOrder, services, data) {
	// - mediaid: media identifier
	controls.tag = function (mediaid) {
		var	self = controls.control.create(controls.editable());
		
		self.hints = controls.tag.hints;

		//////////////////////////////
		// Control

		// removes tag from media entry
		function remove(before) {
			if (before) {
				data.media.removeTag([mediaid], before);
			}
		}
		
		// adds tag to media entry
		function add(after) {
			var names, i;
			if (after) {
				names = data.tag.split(after);
				data.media.addTags(mediaid, names);
			}
		}
		
		// refreshes UI
		self.refresh = function () {
			// redrawing tags for media entry
			this.parent
				.build()
				.render();
			controls.kinds
				.build()
				.render();
		};
		
		// changes tag to one or more tags
		// - before: value before change, either a string or null (insertion)
		// - after: value after change, comma separated string or null (deletion)
		self.changetag = function (before, after) {
			// deleting old tag if there was one
			remove(before);
			
			// adding new value(s) to buffer
			add(after);
			
			// integrity & UI
			this.refresh();
		};
				
		return self;
	};

	//////////////////////////////
	// Static properties

	// hints associated with this control
	controls.tag.hints = [
		"Press ESC to exit edit mode.",
		"Use TAB and SHIFT + TAB to move between tags."
	];
	
	//////////////////////////////
	// Static methods

	controls.tag.scope = function (event) {
		return event.shiftKey ? !Object.isEmpty(controls.media.selected) ? 'selected' : 'all' : event.ctrlKey ? 'search' : 'single';
	};
	
	//////////////////////////////
	// Common static event handlers

	function getSelf(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')];
	}

	// handles navigation events
	function onNav(event) {
		var $this = $(this),
				$next;
		switch (event.which) {
		case 9:
			// tab - jump to next tag
			$next = event.shiftKey ? $this.closest('.tag').prev() : $this.closest('.tag').next();
			if ($next.length) {
				getSelf($this).toggle('display');
				getSelf($next).toggle('edit');
			}
			return false;
		case 27:
			// escape - cancel
			getSelf($this).toggle('display');
			return false;
		}
	}
	
	$('.tag.edit input.focus').live('keydown', onNav);

	return controls;
}(app.controls || {},
	jQuery,
	jOrder,
	app.services,
	app.data);

