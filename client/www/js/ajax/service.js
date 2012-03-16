/**
 * Service Core Functionality
 */
/*global jQuery, window, alert */
var app = app || {};

app.service = function ($) {
    var url = window.location.protocol + '//' + window.location.host;

    /**
     * Creates a service with the specified endpoint.
     * @param endpoint {string} Service endpoint name.
     */
    return function (endpoint) {
        var self = {
            /**
             * Calls a service.
             * @param data {object} Data to be passed to service.
             * @param handler {function} Success handler.
             */
            call: function (data, handler) {
                $.ajax(url + '/' + endpoint, {
                    data: data,
                    dataType: 'json',
                    success: handler,
                    error: function (xhr) {
                        var data = $.parseJSON(xhr.responseText);
                        alert([
                            "Service call failed. Details:",
                            "endpoint: \"" + endpoint + "\"",
                            "message: \"" + data.message + "\""
                        ].join('\n'));
                    }
                });
            },

            /**
             * Calls a unary tag transformation service.
             * @param mediaid {string} Media identifier.
             * @param tag {string} Tag being affected.
             * @param mediaids {string[]}
             * @param handler {function} Success handler.
             * TODO: more detailed explanation needed
             */
            unary: function (mediaid, tag, mediaids, handler) {
                var data = {
                    tag: tag
                };
                if (typeof mediaid !== 'undefined' && mediaid !== null) {
                    data.mediaid = mediaid;
                }
                if (mediaids) {
                    data.mediaids = mediaids;
                }
                self.call(data, handler);
            }
        };

        return self;
    };
}(jQuery);
