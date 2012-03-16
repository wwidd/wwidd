/**
 * Browser Cookie
 */
/*global document */
var app = app || {};

app.model = function (model, services) {
    /**
     * Parses the entire cookie string.
     * @returns {object} Key-value lookup of cookie values.
     */
    function parse() {
        var cookies = document.cookie.split('; '),
            result = {},
            kvp, i;
        for (i = 0; i < cookies.length; i++) {
            kvp = cookies[i].split('=');
            result[kvp[0]] = kvp[1];
        }
        return result;
    }

    model.cookie = function () {
        var self = {
            /**
             * Sets a cookie.
             * @param key {string} Cookie key.
             * @param value {string} Cookie value.
             * @param [days] {number} Expiry in days.
             * @param [path] {string}
             */
            set: function (key, value, days, path) {
                var date = new Date();
                date.setTime(date.getTime() + ((days || 365) * 24 * 3600 * 1000));

                document.cookie = [
                    key, '=', value, '; ',
                    'expires=', date.toGMTString(), '; ',
                    'path=', path || '/'
                ].join('');

                return self;
            },

            /**
             * Returns a cookie value.
             * @param key {string} Cookie key.
             * @returns {string} Cookie value associated with key.
             */
            get: function (key) {
                return parse()[key];
            },

            /**
             * Erases a cookie value.
             * @param key {string} Cookie key.
             */
            unset: function (key) {
                self.set(key, '', -1);
                return self;
            }
        };

        return self;
    }();

    return model;
}(app.model || {},
    app.services);

