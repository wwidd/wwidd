////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder */
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
					tags_table = data.tags.table,
					index_tags = media_table.index('tags'),
					rowId = media_table.index('mediaid').lookup([row])[0];

			// deleting old tag if there was one
			if (before) {
				// removing reference from tags table
				if (index_tags.count(before) === 1) {
					tags_table.remove(tags_table.where([{tag: before.replace(':', '\t')}], {renumber: true}));
				}
				// removing reference from media table
				delete lookup[before];
				index_tags.remove({tags: [before]}, rowId);
			}
			
			// adding new value(s) to buffer
			if (after) {
				names = data.tag(after).split();
				for (i = 0; i < names.length; i++) {
					// adding reference to tags table
					if (index_tags.count(names[i]) === 0) {
						tmp = names[i].split(':');
						tags_table.insert([{tag: tmp.join('\t'), name: tmp[0], kind: tmp[1]}]);
					}
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

