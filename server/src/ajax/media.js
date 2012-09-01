////////////////////////////////////////////////////////////////////////////////
// Media Service Endpoints
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	envelope = require('./envelope').envelope,
		library = require('../logic/library').library,
		media = require('../logic/media').media,
		thumbs = require('../logic/thumbs').thumbs;

// runs the endpoint
// - endpoint: full path of endpoint e.g. "/lib/getall"
// - query: query object
// - res: response object
function run(endpoint, query, res) {
	// executing command
	switch (endpoint) {
	case '/media/get':
		envelope(res, true, function (ok) {
			library.getMedia(query.filter, function (data) {
				ok(data);
			});
		});
		break;

	case '/media/play':
		// playing back media file
		envelope(res, false, function () {
			if (!query.mediaid) {
				throw "Missing path parameter";
			}
			media(query.mediaid).play();
		});
		break;
		
	case '/media/rate':
		// rating a media file
		envelope(res, true, function (ok) {
			if (!query.mediaid || !query.at) {
				throw "Missing parameters";
			}
			media(query.mediaid).rate(query.at, function () {
				ok(query);
			});
		});
		break;
	
	case '/media/extract':
		// generates thumbnails
		envelope(res, true, function (ok) {
			if (!query.mediaids) {
				throw "Missing parameters";
			}
			thumbs.generate(query.mediaids.split(/[^0-9]+/), query.force, function (data) {
				ok(data);
			});
		});
		break;
	
	case '/media/del':
		// deletes media entries
		envelope(res, true, function (ok) {
			if (!query.mediaids) {
				throw "Missing parameters";
			}
			library.delMedia(query.mediaids.split(/[^0-9]+/), function (data) {
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

