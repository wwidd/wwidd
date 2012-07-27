/**
 * Application State
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'State', function ($model, className, $input, $lookup) {
    var base = $model.Model,
        self;

    self = app.model.State = base.extend()
        .addConstant({
            ROOT: ['state']
        })
        .addPublic({
            /**
             *
             */
            cache: flock({}, {nochaining: true})
        })
        .addMethod({
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
                        root = $model[model].ROOT;
                        $input.unset(root);
                        $lookup.unset(root);
                    }
                }
            }
        });

    //////////////////////////////
    // Event bindings

    self.cache
        .on('state.library', flock.CHANGE, self._onLibraryChange);

    return self;
}, app.input, app.lookup);
