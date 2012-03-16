/**
 * Web Services
 */
/*global jQuery, alert, window */
var app = app || {};

app.services = function ($, window, service, poll) {
    return {
        /**
         * Library related services.
         */
        lib: {
            /**
             * Retrieves a list of available libraries.
             * @param handler {function} Success handler.
             */
            getall: function (handler) {
                service('lib/getall').call(null, handler);
            },

            /**
             * Switches to given library.
             * @param libraryName {string} Name of library to switch to.
             * @param handler {function} Success handler.
             */
            select: function (libraryName, handler) {
                service('lib/select').call({
                    name: libraryName
                }, handler);
            },

            /**
             * Initiates the downloading of a library database file.
             * @param libraryName {string} Name of library
             * @param iframe {object} IFrame reference to use for downloading file.
             */
            save: function (libraryName, iframe) {
                iframe.attr('src', '/lib/save?name=' + libraryName);
            }
        },

        /**
         * Media related services.
         */
        media: {
            /**
             * Retrieves all media from the current library (that match the filter) .
             * @param filter {string}
             * @param handler {function} Success handler.
             * TODO: look up what filter does and whether it's still necessary
             */
            get: function (filter, handler) {
                service('media/get').call({
                    filter: filter
                }, handler);
            },

            /**
             * Initiates playback of a media entry.
             * @param mediaid {string} Identifier of affected media entry.
             * @param handler {function} Success handler.
             */
            play: function (mediaid, handler) {
                service('media/play').call({
                    mediaid: mediaid
                }, handler);
            },

            /**
             * Rates a media entry.
             * @param mediaid {string} Identifier of affected media entry.
             * @param rating {number} New rating to be assigned to media entry. 1-5.
             * @param handler {function} Success handler.
             */
            rate: function (mediaid, rating, handler) {
                service('media/rate').call({
                    mediaid: mediaid,
                    at: rating
                }, handler);
            },

            /**
             * Initiates thumbnail generation for a set of media entries.
             * @param mediaids {string} Comma separated list of media identifiers.
             * @param force {boolean} Whether to discard already existing thumbnails.
             * @param handler {function} Success handler.
             */
            extract: function (mediaids, force, handler) {
                var data = {
                    mediaids: mediaids,
                    force: force
                };
                service('media/extract').call(data, handler);
            },

            /**
             * Deletes media entries along with their keywords and tags.
             * @param mediaids {string} Comma separated list of media identifiers.
             * @param handler {function} Success handler.
             */
            del: function (mediaids, handler) {
                var data = {
                    mediaids: mediaids
                };
                service('media/del').call(data, handler);
            }
        },

        /**
         * Tagging related services.
         */
        tag: {
            /**
             * Adds tag to media entry.
             * @param mediaid {string} Identifier of affected media entry.
             * @param tagName {string} Tag name.
             * @param mediaids {string} Comma separated list of media identifiers.
             * @param handler {function} Success handler.
             * TODO: investigate role of mediaid vs. mediaids
             */
            add: function (mediaid, tagName, mediaids, handler) {
                service('tag/add').unary(mediaid, tagName, mediaids, handler);
            },

            /**
             * Sets tag on a media entry.
             * @param mediaid {string} Identifier of affected media entry.
             * @param before {string} Current tag name.
             * @param after {string} New tag name.
             * @param handler {function} Success handler.
             */
            set: function (mediaid, before, after, handler) {
                var data = {
                    before: before,
                    after: after
                };
                if (mediaid) {
                    data.mediaid = mediaid;
                }
                service('tag/set').call(data, handler);
            },

            /**
             * Explodes tag. (Splits along whitespaces.)
             * @param mediaid {string} Identifier of affected media entry.
             * @param tagName {string} Tag name.
             * @param mediaids {string} Comma separated list of media identifiers.
             * @param handler {function} Success handler.
             */
            explode: function (mediaid, tagName, mediaids, handler) {
                service('tag/explode').unary(mediaid, tagName, mediaids, handler);
            },

            /**
             * Deletes tag.
             * @param mediaid {string} Identifier of affected media entry.
             * @param tagName {string} Tag name.
             * @param mediaids {string} Comma separated list of media identifiers.
             * @param handler {function} Success handler.
             * TODO: investigate role of mediaid vs. mediaids
             */
            del: function (mediaid, tagName, mediaids, handler) {
                service('tag/del').unary(mediaid, tagName, mediaids, handler);
            }
        },

        /**
         * Root path related services
         */
        root: {
            /**
             * Adds a root path to library (w/ import)
             * @param path {string} Filesystem path.
             * @param handler {function} Success handler.
             */
            add: function (path, handler) {
                service('root/add').call({
                    path: path
                }, handler);
            }
        },

        /**
         * System related services
         */
        sys: {
            /**
             * Gets directory tree for given root path
             * @param root {string} Unix absolute path(s separadted by commas) without leading slash.
             * @param handler {function} Success handler.
             */
            dirlist: function (root, handler) {
                var data = {};
                if (root) {
                    data.root = root;
                }
                service('sys/dirlist').call(data, handler);
            },

            /**
             * Polls ongoing processes.
             * @param process {string} Process name to poll.
             * @param handler {function} Success handler.
             */
            poll: function (process, handler) {
                poll(process, handler);
            }
        }
    };
}(jQuery,
    window,
    app.service,
    app.poll);
