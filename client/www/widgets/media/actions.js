////////////////////////////////////////////////////////////////////////////////
// Actions Widget
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, jOrder, window */
var app = app || {};

app.widgets = function (widgets, $, wraith, jOrder, model, services) {
    widgets.actions = function () {
        var popup = widgets.select(["Refresh thumbnail", "Delete"]).stateful(false),
                self = wraith.widget.create(widgets.dropdown("Actions", popup));

        // deletes video entries
        function remove(mediaids) {
            if (window.confirm([
                "You're about to delete", mediaids.length, (mediaids.length > 1 ? "entries" : "entry"), "from your library.",
                "This cannot be undone. Proceed?"
            ].join(' '))) {
                // calling deletion service
                // then reloading entire library
                services.media.del(mediaids.join(','), function () {
                    model.media.unset(mediaids);
                    widgets.media.refresh();
                });
            }
        }
        
        // extracts thumbnails and keywords for media entries
        function extract(mediaids) {
            services.media.extract(mediaids.join(','), true, function () {
                widgets.media.poll();
            });
        }
        
        popup.onChange(function (i, item, selected) {
            // obtaining selected media ids
            var mediaids = jOrder.keys(widgets.media.selected);
            
            action:
            switch (i) {
            case 0:
                // extracting from video entries
                extract(mediaids);
                break action;
            case 1:
                // deleting video entries
                remove(mediaids);
                break action;
            default:
            case 1000:
                break action;
            }
        });
        
        return self;
    }();
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    jOrder,
    app.model,
    app.services);

