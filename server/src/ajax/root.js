////////////////////////////////////////////////////////////////////////////////
// Root Path Service Endpoints
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	envelope = require('./envelope').envelope,
		library = require('../logic/library').library;

// runs the endpoint
// - endpoint: full path of endpoint e.g. "/lib/getall"
// - query: query object
// - res: response object
function run(endpoint, query, res) {
	// executing command
	if (endpoint === '/root/add') {
		// adding path to root collection or library
		envelope(res, true, function (ok) {
			if (!query.path) {
				throw "Missing parameters";
			}
			// adding root path
			library.addRoot(query.path, function () {
				ok(query);
			});
		});
		
		return true;
	} else {
		return false;
	}
}

exports.run = run;

