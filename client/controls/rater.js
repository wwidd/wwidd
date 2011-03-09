////////////////////////////////////////////////////////////////////////////////
// Rater Control
//
// This is a temporary rater control, with textual stars that turn into
// a dropdown.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.rater = function (row) {
		var base = controls.editable(),
				self = Object.create(base),

		states = {
			0: "unrated",
			1: "*",
			2: "**",
			3: "***",
			4: "****",
			5: "*****"
		};
		
		// textual representation
		self.display = function () {
			return base.display(self, $('<span />')
				.text(states[row.rating || 0]));
		};

		// dropdown representation
		self.edit = function () {
			return $('<select />', {'class': 'focus'})
				// adding contents
				.append(function () {
					var result = [],
							state;
					for (state in states) {
						result.push($('<option />', {'value': state, 'selected': state === row.rating ? 'selected': null})
							.text(states[state])[0]);
					}
					return $(result);
				}())
				// saving rating 
				.change(function () {
					var $this = $(this),
							rating = $this.val();
					// calling rater service
					services.rate(row.mediaid, rating, function () {
						row.rating = rating;
						self.toggle('display');
					});
				});
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

