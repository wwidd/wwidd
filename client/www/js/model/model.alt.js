/**
 * Model Base Class
 */
/*global flock */
var app = app || {};

app.model = (function ($model, $state, $input, $lookup) {
    var
        // model lookup by root
        lookup = {};

    //////////////////////////////
    // Event handlers

    /**
     * Triggered on changing libraries
     */
    function onLibraryChange() {
        var root;

        // zapping models from cache(s)
        for (root in lookup) {
            if (lookup.hasOwnProperty(root)) {
                $input.unset(root);
                $lookup.unset(root);
            }
        }
    }

    //////////////////////////////
    // Event bindings

    $state.cache
        .on('state.library', flock.CHANGE, onLibraryChange);

    //////////////////////////////
    // Model interface

    $model.modelAlt = flock.extend(Object.prototype, {
        /**
         * @constructor
         * @param root {string|string[]} Flock datastore root path.
         */
        create: function (root) {
            root = flock.path.normalize(root);

            var key = root.join('.'),
                result;

            if (lookup.hasOwnProperty(key)) {
                // fetching model instance from lookup
                return lookup[key];
            } else {
                // creating new model instance
                result = Object.create($model.modelAlt, {
                    root: {value: root}
                });

                // storing new instance in lookup for future use
                lookup[key] = result;

                return result;
            }
        }
    });

    return $model;
}(
    app.model || {},
    app.state,
    app.input,
    app.lookup
));
