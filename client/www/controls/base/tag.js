////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, escape */
var yalp = yalp || {};

yalp.controls = function (controls, $, jOrder, services, data) {
	// - row: media data record
	// - handler: callback redrawing parent
	controls.tag = function (row) {
		var	self = Object.create(controls.editable());
		
		// changes tag to one or more tags
		// - before: value before change, either a string or null (insertion)
		// - after: value after change, comma separated string or null (deletion)
		self.changetag = function (before, after, row) {
			var lookup = jOrder.join(row.tags, []),
					names, i, tmp,
					media_table = data.media.table,
					index_tags = media_table.index('tags'),
					rowId = media_table.index('mediaid').lookup([row])[0];

			// deleting old tag if there was one
			if (before) {
				// removing reference from tags table
				data.tags.remove(before);
				// removing reference from media table
				delete lookup[before];
				index_tags.remove({tags: [before]}, rowId);
			}
			
			// adding new value(s) to buffer
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
			
			// finalizing changes
			row.tags = jOrder.keys(lookup);
			
			// redrawing tags for media entry
			this.parent.render();
			controls.kinds.render();
		};
		
		return self;
	};
	
	return controls;
}(yalp.controls || {},
	jQuery,
	jOrder,
	yalp.services,
	yalp.data);

