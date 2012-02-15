/**
 * Actions Widget
 *
 * Captures:
 * - selectSelected: for executing action command associated with action item
 */
/*global document, window, jQuery, wraith, jOrder, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith, jOrder, model, services) {
    //////////////////////////////
    // Static event handlers

    function onSelectSelected(event, data) {
        // obtaining selected media ids
        // TODO: should be acquired from an app-level state object
        var mediaids = jOrder.keys(widgets.media.selected),
            $this = $(this),
            self = wraith.lookup($this);

        switch (data.item) {
        case 0:
            // extracting from video entries
            self.extract(mediaids);
            break;
        case 1:
            // deleting video entries
            self.remove(mediaids);
            break;
        }
    }

    //////////////////////////////
    // Static event handlers

    $(document)
        .on('selectSelected', '.w_actions', onSelectSelected);

    //////////////////////////////
    // Class

    widgets.actions = (function () {
        var select = widgets.select(["Refresh thumbnail", "Delete"])
                .stateful(false),
            dropdown = widgets.dropdown("Actions")
                .popup(select),
            self = wraith.widget.create();

        //////////////////////////////
        // Control

        /**
         * Deletes video entries
         * @param mediaids Array of media ids
         */
        self.remove = function (mediaids) {
            if (
                window.confirm([
                    "You're about to delete", mediaids.length, (mediaids.length > 1 ? "entries" : "entry"), "from your library.",
                    "This cannot be undone. Proceed?"
                ].join(' '))
            ) {
                // calling deletion service
                // then reloading entire library
                services.media.del(mediaids.join(','), function () {
                    // TODO: use events
                    model.media.unset(mediaids);
                    widgets.media.refresh();
                });
            }
        };

        /**
         * Extracts thumbnails and keywords for media entries
         * @param mediaids Array of media ids
         */
        self.extract = function (mediaids) {
            services.media.extract(mediaids.join(','), true, function () {
                // TODO: use events
                widgets.media.poll();
            });
        };

        //////////////////////////////
        // Overrides

        self.disabled = function (value) {
            dropdown.disabled(value);
            return self;
        };

        self.build = function () {
            dropdown.appendTo(self);
            return self;
        };

        self.html = function () {
            return [
                '<span id="', self.id, '" class="w_actions">',
                dropdown.html(),
                '</span>'
            ].join('');
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

