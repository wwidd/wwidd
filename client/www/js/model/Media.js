/**
 * Media Model Class
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'Media', function ($model, className, $input) {
    var base = $model.Model,
        self;

    self = app.model.Media = base.extend()
        .addConstant({
            ROOT: ['media']
        })
        .addMethod({
            /**
             * Initializes media model.
             * Fills input cache with entries.
             * @param json {object[]} Array of media records.
             */
            init: function (json) {
                var i, row;
                for (i = 0; i < json.length; i++) {
                    row = json[i];
                    $input.set(self.ROOT.concat(row.mediaid), row);
                }
            }
        });

    return self;
}, app.input);
