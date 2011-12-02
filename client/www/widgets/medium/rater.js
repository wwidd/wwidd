////////////////////////////////////////////////////////////////////////////////
// Rater Control
//
// The number of stars represent the rating. Up to five stars can be given.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, model, services) {
	widgets.rater = function (mediaid) {
		var self = wraith.widget.create();

		//////////////////////////////
		// Event handlers

		function onMouseOver() {
			var buttons = $('#' + self.id).find('a');
			
			// filling as many stars as the user points at
			buttons
				.removeClass('star')
				.eq(buttons.index(this))
					.prevAll()
					.andSelf()
						.addClass('star');		
		}
		
		function onClick() {
			var rating = $('#' + self.id).find('a').index(this) + 1;
			// calling rater service
			services.media.rate(mediaid, rating, function () {
				model.media.setRating(model.media.getRow(mediaid), rating);
				self.render();
			});
			return false;
		}
		
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.mouseleave(function () {
					self.render();	
				})
				.find('a')
					.mouseover(onMouseOver)
					.click(onClick);
		};
		
		self.html = function () {
			var row = model.media.getRow(mediaid),
					i,
			
			result = [
				'<div id="', self.id, '" class="w_rater">'
			];
			
			for (i = 0; i < row.rating || 0; i++) {
				result.push('<a href="#" class="star"></a>');
			}
			for (; i < 5; i++) {
				result.push('<a href="#"></a>');
			}
			result.push('</div>');
			
			return result.join('');
		};

		return self;
	};
	
	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	app.model,
	app.services);

