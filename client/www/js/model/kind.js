/**
 * Tag Kind
 */
/*global flock, jOrder */
var app = app || {};

app.model = function (model, jOrder, cache, services) {
    var kinds,
        lookup;

    /**
     * Refreshes tag kind lookup.
     */
    function refreshLookup() {
        kinds = jOrder.keys(cache.get(['kind'])).sort();
        lookup = {};
        var i;
        for (i = 0; i < kinds.length; i++) {
            lookup[kinds[i]] = i % 12 + 1;
        }
    }

    model.kind = function () {
        return {
            /**
             * Gets or creates a new entry in the kind index.
             * @param kind {string} Kind name.
             */
            get: function (kind) {
                var path = ['kind', kind],
                    ref = cache.get(path);
                if (!ref) {
                    ref = {};
                    cache.set(path, ref);
                    refreshLookup();
                }
                return ref;
            },

            /**
             * Removes kind from cache.
             * @param before
             */
            unset: function (before) {
                cache.unset(['kind', before]);
                refreshLookup();
            },

            /**
             * Retrieves numeric representation associated with kind.
             * Each kind has a numeric representation for
             * distinguishing CSS classes, etc.
             * @param kind {string} Kind name.
             * @returns {string} Unique kind ID in "kind##" format.
             */
            getNumber: function (kind) {
                // making sure the default color is not used again
                if (kind === '') {
                    return 'kind0';
                } else {
                    if (!lookup) {
                        refreshLookup();
                    }
                    return 'kind' + lookup[kind];
                }
            }
        };
    }();

    return model;
}(app.model || {},
    jOrder,
    app.cache,
    app.services);

