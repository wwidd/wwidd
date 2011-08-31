////////////////////////////////////////////////////////////////////////////////
// Page State
//
// Contains all information pertaining to the page's state that is not
// stored in other business objects (controls).
////////////////////////////////////////////////////////////////////////////////
var app = app || {};

app.data = function (data) {
	// tag collection
	data.pagestate = {
		// mediaid for the last played video
		lastPlayed: null
	};
	
	return data;
}(app.data || {});

