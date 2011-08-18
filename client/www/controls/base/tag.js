////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, escape */
var yalp = yalp || {};

yalp.controls = function (controls, $, jOrder, services, data) {
	// - row: media data record
	// - handler: callback redrawing parent
	controls.tag = function (row) {
		var	self = controls.control.create(controls.editable()),
				lookup = jOrder.join(row.tags, []),
				media_table = data.media.table,
				index_tags = media_table.index('tags'),
				rowId = media_table.index('mediaid').lookup([row])[0];
		
		// removes tag from media entry
		function remove(before) {
			if (before) {
				// removing reference from tags table
				data.tags.remove(before);
				// removing reference from media table
				delete lookup[before];
				index_tags.remove({tags: [before]}, rowId);
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
					// adding reference to media table
					lookup[names[i]] = true;
					index_tags.add({tags: [names[i]]}, rowId);
				}
			}
		}
		
		// refreshes lookup buffer and UI
		function refresh() {
			// re-writing tags from lookup (data integrity)
			row.tags = jOrder.keys(lookup);
			
			// redrawing tags for media entry
			this.parent.render();
			controls.kinds.render();
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
		self.explode = function (before, row) {
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
}(yalp.controls || {},
	jQuery,
	jOrder,
	yalp.services,
	yalp.data);

