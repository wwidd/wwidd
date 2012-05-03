/**
 * (Alternative) Media Model
 */
/*global flock */
var app = app || {};

app.model = (function (model, flock, input, lookup, services) {
    var ROOT = ['rating'];

    //////////////////////////////
    // Event handlers

    /**
     * Fires when a media entry is changed in the input cache.
     * Updates rating lookup when a media entry is changed.
     */
    input.on('media', flock.CHANGE, function (event, data) {
        if (event.target.split('.').length !== 2) {
            // only full media entry changes are considered
            return;
        }

        if (data.before) {
            // removing old entry
            lookup
                .unset(ROOT.concat([data.before.rating, 'items', data.before.mediaid]))
                .add(ROOT.concat([data.before.rating, 'count']), -1);
        }
        if (data.after) {
            // adding new entry
            lookup
                .set(ROOT.concat([data.after.rating, 'items', data.after.mediaid]), data.after)
                .add(ROOT.concat([data.after.rating, 'count']), 1);
        }
    });

    //////////////////////////////
    // Model interface

    model.ratingAlt = {
        /**
         * Retrieves list of media associated with rating.
         */
        getMedia: function (rating) {
            return lookup.get(ROOT.concat([rating, 'items']), true);
        },

        /**
         * Retrieves media enrty count associated with rating.
         */
        getCount: function (rating) {
            return lookup.get(ROOT.concat([rating, 'count']), true);
        }
    };

    return model;
}(
    app.model || {},
    flock,
    app.input,
    app.lookup
));
