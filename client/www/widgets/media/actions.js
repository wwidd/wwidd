////////////////////////////////////////////////////////////////////////////////
// Actions Widget
////////////////////////////////////////////////////////////////////////////////
/*global window, jQuery, wraith, jOrder, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith, jOrder, model, services) {
    widgets.actions = (function () {
        var popup = widgets.select(["Refresh thumbnail", "Delete"]).stateful(false),
            base = widgets.dropdown("Actions", popup),
            self = wraith.widget.create(base);

        /**
         * Deletes video entries
         * @param mediaids Array of media ids
         */
        function remove(mediaids) {
            if (
                window.confirm([
                    "You're about to delete", mediaids.length, (mediaids.length > 1 ? "entries" : "entry"), "from your library.",
                    "This cannot be undone. Proceed?"
                ].join(' '))
            ) {
                // calling deletion service
                // then reloading entire library
                services.media.del(mediaids.join(','), function () {
                    model.media.unset(mediaids);
                    widgets.media.refresh();
                });
            }
        }

        /**
         * extracts thumbnails and keywords for media entries
         * @param mediaids Array of media ids
         */
        function extract(mediaids) {
            services.media.extract(mediaids.join(','), true, function () {
                widgets.media.poll();
            });
        }

        // specifying callback for popup
        popup.onChange(function (i) {
            // obtaining selected media ids
            var mediaids = jOrder.keys(widgets.media.selected);

            switch (i) {
            case 0:
                // extracting from video entries
                extract(mediaids);
                break;
            case 1:
                // deleting video entries
                remove(mediaids);
                break;
            default:
            //case 1000:
                break;
            }
        });

        //////////////////////////////
        // Overrides

        self.init = function ($elem) {
            base.init.apply(self, arguments);
            $elem
                .addClass('w_actions');
        };

        return self;
    }());
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    jOrder,
    app.model,
    app.services));

