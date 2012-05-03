/**
 * (Alternative) Media Model
 */
/*global flock */
var app = app || {};

app.model = (function ($model, flock, $input, $lookup) {
    var ROOT = ['rating'];

    //////////////////////////////
    // Event handlers

    function changeRating(before, after) {

    }

    /**
     * Fires when a media entry is changed in the input cache.
     * Updates rating lookup when a media entry is changed.
     */
    $input.on('media', flock.CHANGE, function (event, data) {
        var path = flock.path.normalize(event.target),
            ratingBefore, ratingAfter,
            mediaBefore, mediaAfter;

        if (flock.query.match(path, 'media.*.rating')) {
            // saving ratings before and after change
            ratingBefore = data.before;
            ratingAfter = data.after;

            // obtainig media entries
            path.pop();
            mediaBefore =
                mediaAfter =
                    $input.get(path, true);
        } else if (flock.query.match(path, 'media.*')) {
            mediaBefore = data.before;
            mediaAfter = data.after;

            // saving ratings before and after change
            ratingBefore = mediaBefore ? mediaBefore.rating : undefined;
            ratingAfter = mediaAfter ? mediaAfter.rating : undefined;
        }

        if (mediaBefore) {
            // removing old entry
            $lookup
                .unset(ROOT.concat([ratingBefore, 'items', mediaBefore.mediaid]))
                .add(ROOT.concat([ratingBefore, 'count']), -1);
        }

        if (mediaAfter) {
            // adding new entry
            $lookup
                .set(ROOT.concat([ratingAfter, 'items', mediaAfter.mediaid]), mediaAfter)
                .add(ROOT.concat([ratingAfter, 'count']), 1);
        }
    });

    //////////////////////////////
    // Model interface

    $model.ratingAlt = flock.utils.extend(Object.prototype, {
        /**
         * Retrieves list of media associated with rating.
         * @param rating {number|string} Media rating value.
         */
        getMedia: function (rating) {
            return $lookup.get(ROOT.concat([rating, 'items']), true);
        },

        /**
         * Retrieves media enrty count associated with rating.
         * @param rating {number|string} Media rating value.
         */
        getCount: function (rating) {
            return $lookup.get(ROOT.concat([rating, 'count']), true);
        },

        /**
         * Sets rating on media entry
         * @param mediaid {string} Media entry ID.
         * @param rating {number|string} Media rating value.
         */
        setRating: function (mediaid, rating) {
           $input.set(['media', mediaid, 'rating'], rating);
        }
    });

    return $model;
}(
    app.model || {},
    flock,
    app.input,
    app.lookup
));
