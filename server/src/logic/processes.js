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
	extractor: chain(function (filePath, finish) {
		extract.exec(filePath, ['--verbose', '--filename'], function (data) {
			var	keywords = data[0];
			finish({path: filePath, keywords: keywords});
		});
	})
};

exports.processes = processes;

