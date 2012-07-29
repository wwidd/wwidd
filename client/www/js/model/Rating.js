/**
 * Media Rating Class
 *
 * Model class managing ratings
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'Rating', function ($model, className, $cache) {
    var base = $model.Model,
        self;

    /**
     * @class
     * @static
     */
    self = app.model.Rating = base.extend()
        .addConstant({
            ROOT: ['rating']
        })
        .addMethod({
            //////////////////////////////
            // Model interface

            /**
             * Retrieves list of media associated with rating.
             * @param rating {number|string} Media rating value.
             * @return {object}
             * @static
             */
            getMediaIds: function (rating) {
                return Object.keys($cache.get(self.ROOT.concat([rating, 'items'])));
            },

            /**
             * Retrieves media entry count associated with rating.
             * @param rating {number|string} Media rating value.
             */
            getCount: function (rating) {
                return $cache.get(self.ROOT.concat([rating, 'count']));
            },

            /**
             * Sets rating on media entry
             * @param mediaId {string} Media entry ID.
             * @param rating {number|string} Media rating value.
             */
            setRating: function (mediaId, rating) {
                $cache.set($model.Media.ROOT.concat([mediaId, 'rating']), rating);
            }
        })
        .addPrivateMethod({
            //////////////////////////////
            // Event handlers

            /**
             * Changes rating lookup according to before and after values of media entries.
             * @param before
             * @param before.media {object} Before value of media entry.
             * @param before.rating {boolean} Before value of media rating.
             * @param after
             * @param after.media {object} After value of media entry.
             * @param after.rating {boolean} After value of media rating.
             */
            _changeRating: function (before, after) {
                if (before.media) {
                    // removing old entry
                    $cache
                        .unset(self.ROOT.concat([before.rating, 'items', before.media.mediaid]))
                        .add(self.ROOT.concat([before.rating, 'count']), -1);
                }

                if (after.media) {
                    // adding new entry
                    $cache
                        .set(self.ROOT.concat([after.rating, 'items', after.media.mediaid]), true)
                        .add(self.ROOT.concat([after.rating, 'count']), 1);
                }
            },

            /**
             * Triggered on changing of rating *values*.
             */
            _onMediaRatingChanged: function (event, data) {
                var path = flock.path.normalize(event.target),
                    mediaEntry;

                // obtainig affected media entry
                path.pop();
                mediaEntry = $cache.get(path, true);

                self._changeRating({
                    rating: data.before,
                    media: mediaEntry
                }, {
                    rating: data.after,
                    media: mediaEntry
                });
            },

            /**
             * Triggered on changing of entire media entries.
             */
            _onMediaEntryChanged: function (event, data) {
                self._changeRating({
                    rating: data.before ? data.before.rating : undefined,
                    media: data.before
                }, {
                    rating: data.after ? data.after.rating : undefined,
                    media: data.after
                });
            }
        });

    return self;
}, app.cache);

//////////////////////////////
// Static event bindings

(function (Media, Rating) {
    Media
        .on('*.rating', flock.CHANGE, Rating._onMediaRatingChanged)
        .on('*', flock.CHANGE, Rating._onMediaEntryChanged);
}(
    app.model.Media,
    app.model.Rating
));
