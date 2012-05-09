/**
 * Application State
 */
/*global flock */
var app = app || {};

app.state = (function () {
    var cache = flock({}, {nochaining: true});

    return flock.utils.extend(Object.prototype, {
        cache: cache,

        library: function (value) {
            var path = 'state.library';
            if (typeof value === 'string') {
                cache.set(path, value);
            } else {
                return cache.get(path);
            }
            return this;
        }
    }, true);
}());
