////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, escape */
var app = app || {};

app.controls = function (controls, $, jOrder, services, data) {
	// - row: media data record
	controls.tag = function (row) {
		var	self = controls.control.create(controls.editable());
		
		self.hints = controls.tag.hints;

		//////////////////////////////
		// Control

		// removes tag from media entry
		function remove(before) {
			if (before) {
				// removing reference from tags table
				data.tags.remove(before);

				// removing reference from media table
				data.media.removeTag(row.mediaid, before);
			}
		}
		
		// adds tag to media entry
		function add(after) {
			var names, i, tmp;
			if (after) {
				names = data.tag(after).split();
				for (i = 0; i < names.length; i++) {
					// adding reference to tags table
					tmp = names[i].split(':');
					data.tags.add(tmp[0], tmp[1]);

					// adding tag to media table
					data.media.addTag(row.mediaid, names[i]);
				}
			}
		}
		
		// refreshes UI
		function refresh() {
			// redrawing tags for media entry
			this.parent
				.build()
				.render();
			controls.kinds
				.build()
				.render();
		}
		
		// changes tag to one or more tags
		// - before: value before change, either a string or null (insertion)
		// - after: value after change, comma separated string or null (deletion)
		self.changetag = function (before, after) {
			// deleting old tag if there was one
			remove(before);
			
			// adding new value(s) to buffer
			add(after);
			
			// integrity & UI
			refresh.call(this);
		};
		
		// explodes a key to its components
		self.explode = function (before) {
			// removing original tag
			remove(before);
			
			// adding exploded bits
			var tmp = before.split(':'),
					names = tmp[0].split(' '),
					kind = tmp[1],
					i, after;
			for (i = 0; i < names.length; i++) {
				after = names[i];
				if (!after.length) {
					continue;
				}
				add(after + (kind ? ':' + kind : ''));
			}

			// integrity & UI
			refresh.call(this);
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

