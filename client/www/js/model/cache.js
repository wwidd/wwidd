/**
 * Application Cache
 */
/*global flock */
var app = app || {};

/**
 * General purpose cache.
 * TODO: eliminate
 */
app.cache = flock({}, {nochaining: true});

/**
 * Input cache. This is where services deliver data.
 * Model classes react to events triggered in this datastore.
 */
app.input = flock();

/**
 * Lookup cache. This is where convenience data structures
 * are maintained by model classes. Does not support events.
 */
app.lookup = flock({}, {noevent: true});

/**
 * Search index. This is where the text search index is kept.
 * Does not support events.
 */
app.search = flock({}, {noevent: true});
