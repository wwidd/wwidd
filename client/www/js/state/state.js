/**
 * Application State
 */
/*global flock */
var app = app || {};

app.state = (function () {
    var self = flock.utils.extend(Object.prototype, {
        //////////////////////////////
        // Constants

        ROOT: ['state'],

        //////////////////////////////
        // Static properties

        cache: flock({}, {nochaining: true}),

        //////////////////////////////
        // Model interface

        /**
         * Sets or gets library name.
         * @param value {string} Library name.
         * @return {*}
         */
        library: function (value) {
            var path = self.ROOT.concat('library');
            switch (typeof value) {
            case 'string':
                self.cache.set(path, value);
                break;
            case 'undefined':
                return self.cache.get(path);
            }
        }
    });

    return self;
}());
