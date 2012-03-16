/**
 * Polling Background Processes
 */
/*global jQuery, alert, window */
var app = app || {};

app.poll = function (service) {
    var stopped = true, // whether polling is stopped
        delay = 2000;   // delay between polls

    /**
     * Polls a background process-
     * @param process {string} Name of process.
     * @param handler {function} Handler to call on each poll.
     */
    return function (process, handler) {
        if (!stopped) {
            return;
        }

        stopped = false;

        function next() {
            service('sys/poll').call({
                process: process
            }, function (json) {
                var progress = json.data.progress;

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
