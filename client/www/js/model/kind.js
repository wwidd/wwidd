////////////////////////////////////////////////////////////////////////////////
// Tag Kinds Data
////////////////////////////////////////////////////////////////////////////////
/*global flock, jOrder */
var app = app || {};

app.model = function (model, jOrder, cache, services) {
    var kinds,
            lookup;
    
    function refresh() {
        kinds = jOrder.keys(cache.get(['kind'])).sort();
        lookup = {};
        var i;
        for (i = 0; i < kinds.length; i++) {
            lookup[kinds[i]] = i % 12 + 1;
        }
    }
    
    model.kind = function () {
        var self = {
            // gets or creates a new entry in the kind index
            get: function (kind) {
                var path = ['kind', kind],
                        ref = cache.get(path);
                if (!ref) {
                    ref = {};
                    cache.set(path, ref);
                    refresh();
                }
                return ref;
            },

            // removes kind from cache
            unset: function (before) {
                cache.unset(['kind', before]);
                refresh();
            },
            
            // retrieves the number assigned to the kind
            getNumber: function (kind) {
                // making sure the default color is not used again
                if (kind === '') {
                    return 'kind0';
                } else {
                    if (!lookup) {
                        refresh();
                    }
                    return 'kind' + lookup[kind];
                }
            }
        };

        return self;
    }();
    
    return model;
}(app.model || {},
    jOrder,
    app.cache || (app.cache = flock()),
    app.services);

