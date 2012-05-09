/**
 * (Alternative) Media Model
 */
/*global flock */
var app = app || {};

app.model = (function ($model, $input) {
    //////////////////////////////
    // Model interface

    $model.mediaAlt = flock.utils.extend($model.modelAlt.create('media'), {
        /**
         * Initializes media model.
         * Fills input cache with entries.
         * @param json {object[]} Array of media records.
         */
        init: function (json) {
            var i, row;
            for (i = 0; i < json.length; i++) {
                row = json[i];
                $input.set(this.root.concat(row.mediaid), row);
            }
        }
    });

    return $model;
}(
    app.model || {},
    app.input
));
