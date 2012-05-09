/**
 * (Alternative) Media Model
 */
/*global flock */
var app = app || {};

app.model = (function ($model, flock, $state, $input, $lookup) {
    var ROOT = ['rating'];

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
    function changeRating(before, after) {
        if (before.media) {
            // removing old entry
            $lookup
                .unset(ROOT.concat([before.rating, 'items', before.media.mediaid]))
                .add(ROOT.concat([before.rating, 'count']), -1);
        }

        if (after.media) {
            // adding new entry
            $lookup
                .set(ROOT.concat([after.rating, 'items', after.media.mediaid]), after.media)
                .add(ROOT.concat([after.rating, 'count']), 1);
        }
    }

    /**
     * Triggered on changing libraries
     */
    function onLibraryChange() {
        // zapping ratings root
        $lookup.unset(ROOT);
    }

    /**
     * Triggered on changing of rating *values*.
     */
    function onMediaRatingChanged(event, data) {
        var path = flock.path.normalize(event.target),
            mediaEntry;

        // obtainig affected media entry
        path.pop();
        mediaEntry = $input.get(path, true);

        changeRating({
            rating: data.before,
            media: mediaEntry
        }, {
            rating: data.after,
            media: mediaEntry
        });
    }

    /**
     * Triggered on changing of entire media entries.
     */
    function onMediaEntryChanged(event, data) {
        changeRating({
            rating: data.before ? data.before.rating : undefined,
            media: data.before
        }, {
            rating: data.after ? data.after.rating : undefined,
            media: data.after
        });
    }

    //////////////////////////////
    // Event bindings

    $state.cache
        .on('state.library', flock.CHANGE, onLibraryChange);

    $input
        .delegate('media', flock.CHANGE, 'media.*.rating', onMediaRatingChanged)
        .delegate('media', flock.CHANGE, 'media.*', onMediaEntryChanged);

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
    app.state,
    app.input,
    app.lookup
));
