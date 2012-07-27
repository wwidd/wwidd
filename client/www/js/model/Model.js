/**
 * Model Base Class
 *
 * Each model class is associated with a certain root path in the cache.
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'Model', function () {
    return app.model.Model = troop.base.extend()
        .addConstant({
            /**
             * Root path to data managed by model class
             */
            ROOT: undefined
        });
});
