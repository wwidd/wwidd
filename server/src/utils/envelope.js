////////////////////////////////////////////////////////////////////////////////
// Request-Response Envelope
//
// Takes care of exception handling and constructing JSON response.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, process, console */
var	gzip = require('../tools/gzip').gzip,

// envelopes a request
// - res: response object
// - async: wehter handler is async
// - handler: enveloped function
//   when sync, should return the data
//   when async, should call the function returned
envelope = function (res, async, handler) {
	// final ok handler
	function ok(data) {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Content-Encoding': 'gzip',
			'Cache-Control': 'no-cache'
		});
		gzip.exec(function (data) {
			res.end(data, 'binary');
		});
		gzip.pipe(JSON.stringify({
			'status': 'OK',
			'data': data
		}));
	}

	// final error handler
	function error(err) {
		console.log("ERROR: " + err);
		res.writeHead(400, {'Content-Type': 'application/json'});
		res.end(JSON.stringify({
			'status': 'ERROR',
			'message': err
		}), 'binary');
	}
	
	// handling async exceptions
	process.on('uncaughtException', error);
	
	try {
		if (!handler) {
			throw "Envelope handler was not specified";
		}
		if (async) {
			handler(ok);
			return ok;
		} else {
			ok(handler());
		}
	} catch (message) {
		error(message);
	}
};
		
exports.envelope = envelope;

