////////////////////////////////////////////////////////////////////////////////
// Rater Control
//
// The number of stars represent the rating. Up to five stars can be given.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.rater = function (row) {
		var base = controls.control,
				self = Object.create(base),
				UI;

		// generates a rater UI with no. of stars equal to rating
		function getUI(rating) {
			// constructing jQuery object
			var $result = $('<div />', {'class': 'rater'})
				.append('<span />')
				.append('<span />')
				.append('<span />')
				.append('<span />')
				.append('<span />');

			// filling stars
			if (row.rating > 0) {
				$result.find('span')
					.eq(row.rating - 1)
						.prevAll()
						.andSelf()
							.addClass('star');
			}
			
			return $result;
		}
		
		self.getUI = function () {
			var 
			
			// creates a UI with mouse handler
			$result = getUI(row.rating)
				.mouseleave(function () {
					self.redraw();	
				}),

			// adding event handlers to stars (filled or otherwise)
			$spans = $result.children('span')
				.mouseover(function () {
					// fills as many stars as the user points at
					$spans
						.removeClass('star')
						.eq($spans.index(this))
							.prevAll()
							.andSelf()
								.addClass('star');
				})
				.click(function () {
					var rating = $spans.index(this) + 1;
					// calling rater service
					services.rate(row.mediaid, rating, function () {
						row.rating = rating;
						self.redraw();
					});
				});

			return $result;
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

