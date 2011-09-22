////////////////////////////////////////////////////////////////////////////////
// Polling Background Processes
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert, window */
var app = app || {};

app.poll = function (service) {
	var stopped = true,			// whether polling is stopped
			delay = 2000;				// delay between polls
	
	// polls a background process
	// - process: name of process
	// - handler: handler to call on each poll
	return function (process, handler) {
		if (!stopped) {
			return;
		}

		stopped = false;
		
		function next() {
			service('sys/poll').call({
				process: process
			}, function (json) {
				var progress = json.data.progress,
						load = json.data.progress;
				
				// calling handler
				if (handler) {
					handler(json.data);
				}
				
				// initiating next poll
				if (typeof progress !== 'undefined' && progress !== -1) {
					window.setTimeout(next, delay);
				} else {
					stopped = true;
				}
			});
		}
		next();
	};
}(app.service);
