////////////////////////////////////////////////////////////////////////////////
// Search Box Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, services, data) {
	var RE_FILTER_CROP = /[^\s,].*[^\s,]/,
			RE_FILTER_SPLIT = /,/;
	
	widgets.search = function () {
		var self = wraith.widget.create(),
				filter = "";

		//////////////////////////////
		// Getters, setters

		self.filter = function (value) {
			if (typeof value === 'undefined') {
				return filter;
			} else {
				filter = value;
				return self;
			}
		};
		
		//////////////////////////////
		// Control

		self.reset = function () {
			filter = "";
			self.render();
		};

		//////////////////////////////
		// Event handlers

		// performs search, filters list of media entries by search terms
		// - elem: input element intercepting events
		// - term: search term as string
		//	 (comma separated list of terms in logical AND relation)
		// - complete: whether the search expression is complete. the last term in an
		//	 incomplete expression is discarded
		function run(elem, term, complete) {
			var tmp = term;
			
			// cutting last term from incomplete expression
			if (!complete) {
				tmp = tmp.split(RE_FILTER_SPLIT);
				tmp = tmp.slice(0, tmp.length - 1).join(',');
			}
			
			// filtreing out leading and trailing commas and spaces
			filter = (RE_FILTER_CROP.exec(tmp) || [''])[0];
			
			if (data.media.filter(filter)) {
				// result set changed
				elem.siblings('.backdrop').val('');				
				widgets.pager.reset();
				widgets.media.refresh();
				widgets.url.set();
			}
		}

		function onChange(event) {
			var $this = $(this),
					term = $this.val(),
					match, name;
			
			if (event.which === 188 ||
					event.which === 13) {
				run($this, term, true);
			} else {
				match = !term.length ? "" : [
					term,
					data.tags.searchWord(term).substr(term.length)
				].join('');
				$this.siblings('.backdrop')
					.val(match)
					.scrollLeft($this.scrollLeft());
				run($this, term);
			}
		}
		
		function onControl(event) {
			// making input field lose focus on hitting Esc
			if (event.which === 27) {
				$(this).blur();
			}
		}
		
		function onClear() {
			var $input = $(this).siblings('.focus');
			if (!filter.length) {
				return false;
			}
			$input.val('');
			run($input, '');
			return false;
		}
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.children('.focus')
					.keyup(onChange)
					.keydown(onControl)
				.end()
				.children('.clear').click(onClear).end();
			return false;
		};
		
		self.html = function () {
			return [
				'<span id="' + self.id + '" class="search">',
				'<a class="clear" href="#"></a>',
				'<span class="icon"></span>',
				'<input type="text" class="focus" value="' + filter + '" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join(' ');
		};
				
		return self;
	}();
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	app.services,
	app.data);

