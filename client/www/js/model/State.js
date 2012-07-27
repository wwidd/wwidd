/**
 * Application State
 *
 * TODO: common cache object with other model classes
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'State', function ($model, className, $cache) {
    var base = $model.Model,
        self;

    self = app.model.State = base.extend()
        .addConstant({
            ROOT: ['state']
        })
        .addMethod({
            //////////////////////////////
            // Setters, getters

            /**
             * Sets or gets library name.
             * @param value {string} Library name.
             * @return {*}
             */
            library: function (value) {
                var path = self.ROOT.concat('library');
                switch (typeof value) {
                case 'string':
                    $cache.set(path, value);
                    break;
                case 'undefined':
                    return $cache.get(path, true);
                }
            },

            /**
             * Sets or gets last played
             * @param value
             */
            lastPlayed: function (value) {
                var path = self.ROOT.concat('lastPlayed');
                switch (typeof value) {
                case 'string':
                    $cache.set(path, value);
                    break;
                case 'undefined':
                    return $cache.get(path, true);
                }
            }
        })
        .addPrivateMethod({
            //////////////////////////////
            // Event handlers

            /**
             * Triggered on changing libraries.
             * Empties all model data from cache.
             */
            _onLibraryChange: function () {
                var model, root;

                // zapping models from cache(s)
                for (model in $model) {
                    if ($model.hasOwnProperty(model) &&
                        self.isPrototypeOf($model[model])
                        ) {
                        $cache.unset($model[model].ROOT);
                    }
                }
            }
        });

    //////////////////////////////
    // Event bindings

    self.on('library', flock.CHANGE, self._onLibraryChange);

    return self;
}, app.input);
