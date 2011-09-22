////////////////////////////////////////////////////////////////////////////////
// Library Service Endpoints
////////////////////////////////////////////////////////////////////////////////
/*global require, console, exports */
var	envelope = require('ajax/envelope').envelope,
		library = require('logic/library').library;

// runs the endpoint
// - endpoint: full path of endpoint e.g. "/lib/getall"
// - query: query object
// - res: response object
function run(endpoint, query, res) {
	// executing command
	switch (endpoint) {
	case '/lib/getall':
		// retrieves library list and information on selected library
		envelope(res, true, function (ok) {
			library.list(function (data) {
				ok(data);
			});
		});
		break;
		
	case '/lib/select':
		// sets the selected library
		envelope(res, true, function (ok) {
			if (!query.name) {
				throw "Missing parameters";
			}
			library.set(query.name, function (data) {
				console.log("library changed");
				ok(data);
			});
		});
		break;
		
	default:
		return false;
	}
	
	return true;
}

exports.run = run;

