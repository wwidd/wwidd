/**
 * Application Cache
 */
/*global flock */
var app = app || {};

flock.defaultOptions({nolive: true, nochaining: true});

app.cache = flock({});
