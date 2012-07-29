/**
 * Media Model
 */
/*global troop, app, jOrder, flock, escape */
troop.promise(app.registerNameSpace('model'), 'Media', function ($model, className, $cache, $services) {
    var base = $model.Model,
        self;

    self = app.model.Media = base.extend()
        .addConstant({
            EVENT_MEDIA_FINISHED: 'eventMediaFinished'
        })
        .addPublic({
            /** @override */
            ROOT: ['media']
        })
        .addMethod({
            init: function () {
                $services.media.get('', self._onData);
            }
        })
        .addPrivateMethod({
            /**
             * Flips values <-> indexes of an array.
             * @param array {*[]}
             * @return {object}
             * @private
             */
            _toHash: function(array) {
                var result = {},
                    i;
                for (i = 0; i < array.length; i++) {
                    result[array[i]] = true;
                }
                return result;
            },

            /**
             * Receives service data.
             * @param json {object} Service response
             * @param json.data {object}
             * @param json.status {string}
             * @private
             */
            _onData: function (json) {
                var toHash = self._toHash,
                    data = json.data,
                    path = self.ROOT.concat(0),
                    last = path.length - 1,
                    i, entry;

                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        entry = data[i];
                        path[last] = entry.mediaid;

                        // preprocessing tags and keywords
                        entry.tags = toHash(entry.tags);
                        entry.keywords = toHash(entry.keywords);

                        $cache.set(path, entry);
                    }
                }

                $cache
                    .trigger(self.ROOT, self.EVENT_MEDIA_FINISHED);
            }
        });
}, app.cache, app.services);
