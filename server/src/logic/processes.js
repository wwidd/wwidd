////////////////////////////////////////////////////////////////////////////////
// Background Processes
//
// Singleton that batches background processes such as metadata extraction,
// snapshot extraction, etc. together.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	chain = require('../utils/chain').chain,
		extract = require('../tools/extract').extract,

processes = {
	// callback expects a path where the root part
	// and relative part are separated by colon
	// - path: e.g. "/media/HDD:/videos"
	// - finish: callback for each element in process chain 
	extractor: chain(function (path, finish) {
		var tmp = path.split(':'),
				root = tmp[0],
				relative = tmp[1];
		extract.exec(root + relative, ['--verbose', '--filename'], function (data) {
			var	keywords = data[0];
			finish({path: relative, keywords: keywords});
		});
	})
};

exports.processes = processes;

