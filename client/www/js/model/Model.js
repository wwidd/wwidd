/**
 * Model Base Class
 *
 * Each model class is associated with a certain root path in the cache.
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'Model', function ($model, className, $cache) {
    return app.model.Model = troop.base.extend()
        .addPublic({
            /**
             * Root path to data managed by model class
             */
            ROOT: undefined
        })
        .addMethod({
            /**
             * Event subscription.
             * @param path {string|string[]} Datastore path relative to model root.
             * @param handler {function} Event handler callback. Receives arguments `event` and `data`.
             */
            on: function (path, eventName, handler) {
                path = flock.query.normalize(path);

                $cache.delegate(
                    this.ROOT,
                    eventName,
                    this.ROOT.concat(path),
                    handler);

                return this;
            },

            /**
             * Event unsubscription.
             * Unsubscribes from all events associated with model.
             */
            off: function () {
                $cache.off(this.ROOT);

                return this;
            }
        });
}, app.cache);
