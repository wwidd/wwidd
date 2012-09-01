////////////////////////////////////////////////////////////////////////////////
// System Service Endpoints
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	envelope = require('./envelope').envelope,
		processes = require('../logic/processes').processes,
		system = require('../utils/system').system;

// runs the endpoint
// - endpoint: full path of endpoint e.g. "/lib/getall"
// - query: query object
// - res: response object
function run(endpoint, query, res) {
	// executing command
	switch (endpoint) {
	case '/sys/dirlist':
		// querying directory structure
		envelope(res, false, function () {
			return system.tree(query.root ? query.root.split(',') : null);
		});
		break;
	
	case '/sys/poll':
		// polling processes
		envelope(res, true, function (ok) {
			if (!query.process) {
				throw "Missing parameters";
			}
			processes.poll(query.process, function (data) {
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

