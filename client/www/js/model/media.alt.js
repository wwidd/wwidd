/**
 * (Alternative) Media Model
 */
/*global flock */
var app = app || {};

app.model = (function (model, flock, state, input, lookup, services) {
    //////////////////////////////
    // Event handlers

    function onLibraryChange() {
        // zapping media root
        input.unset('media');
    }

    //////////////////////////////
    // Event bindings

    state.cache
        .on('state.library', flock.CHANGE, onLibraryChange);

    //////////////////////////////
    // Model interface

    model.mediaAlt = {
        /**
         * Initializes media model.
         * Fills input cache with entries.
         * @param json {object[]} Array of media records.
         */
        init: function (json) {
            var i, row;
            for (i = 0; i < json.length; i++) {
                row = json[i];
                input.set(['media', row.mediaid], row);
            }
        }
    };

    return model;
}(
    app.model || {},
    flock,
    app.state,
    app.input,
    app.lookup
));
