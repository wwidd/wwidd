////////////////////////////////////////////////////////////////////////////////
// Tag Adder Control
//
// Adds tags to a video
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, confirm */
var yalp = yalp || {};

yalp.controls = function (controls, $, jOrder, services, data) {
	// - row: media data record
	controls.tagadd = function (row) {
		var	self = controls.control.create(controls.tag(row));

		self.data.row = row;	

		//////////////////////////////
		// Overrides
		
		self.display = function () {
			return [
				'<span id="', self.id, '" class="tag editable display add">',
				'<a href="#">', "+", '</a>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag edit add">',
				'<input type="text" class="focus" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers

	function getSelf(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')];
	}
	
	// tag addition handler: do nothing
	function onAdd(event) {
		var self = getSelf($(this));
		self.parent.add();
		return false;
	}

	// tag change event handler
	function onChange(event) {
		var $this = $(this),
				self = getSelf($this),
				row = self.data.row,
				term = $this.val(),
				match = !term.length ? "" :
					term +
					data.tags.searchTag(term.toLowerCase()).substr(term.length),
				name = match.length ? match : term,
				filter;
		
		switch (event.which) {
		case 13:
			// enter - saving values
			name = data.tag(name).sanitize();
			if (!name.length) {
				return;
			}
			if (event.shiftKey) {
				// shift + enter is handled only when entry is selected (and possibly others)
				if (self.parent.parent.selected() && confirm("Add this to SELECTED videos?")) {
					services.addtag(null, name, null, jOrder.keys(controls.library.selected).join(','), controls.library.load);
				}
			} else if (event.ctrlKey) {
				// adding tag(s) to multiple media
				filter = controls.search.filter;
				if (filter.length && confirm("Add this to SEARCH results?")) {
					services.addtag(null, name, filter, null, controls.library.load);
				}
			} else {
				// adding tag(s) to simgle media file
				services.addtag(row.mediaid, name, null, null, function () {
					self.changetag(null, name, row);
					self.parent.add();
				});
			}
			break;
		case 27:
			// escape - cancel
			self.toggle('display');
			break;
		default:
			// any other key - filling backdrop
			$this.siblings('.backdrop')
				.val(name)
				.scrollLeft($this.scrollLeft());
			break;
		}
	}

	$('.tag.add.display a').live('click', onAdd);
	$('.tag.add.edit input.focus').live('keyup', onChange);

	return controls;
}(yalp.controls || {},
	jQuery,
	jOrder,
	yalp.services,
	yalp.data);

