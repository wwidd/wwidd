/**
 * Actions Widget
 *
 * Despatches:
 * - actionsOptionSelected: on having clicked an option in the actions dropdown
 *
 * Captures:
 * - selectSelected: for executing action command associated with action item
 */
/*global document, window, jQuery, wraith, jOrder, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith, jOrder) {
    //////////////////////////////
    // Static event handlers

    /**
     * Selects an option by propagating the event.
     * @param option {String} One of the action options ('extract', 'remove')
     * @param mediaids {Array} List of affected media IDs
     */
    function selected(option, mediaids) {
        this.ui()
            .trigger('actionsOptionSelected', {
                widget: this,
                option: option,
                mediaids: mediaids
            });
    }

    /**
     * Fires when an option in the select window was selected.
     * @param event jQuery event object
     * @param data {Object} Custom event data containing index of selected item.
     */
    function onSelectSelected(event, data) {
        // obtaining selected media ids
        // TODO: should be acquired from an app-level state object
        var mediaids = jOrder.keys(widgets.media.selected),
            $this = $(this),
            self = wraith.lookup($this);

        switch (data.item) {
        case 0:
            // extracting from video entries
            selected.call(self, 'extract', mediaids);
            break;
        case 1:
            // deleting video entries
            if (
                window.confirm([
                    "You're about to delete", mediaids.length, (mediaids.length > 1 ? "entries" : "entry"), "from your library.",
                    "This cannot be undone. Proceed?"
                ].join(' '))
            ) {
                selected.call(self, 'remove', mediaids);
            }
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
    jOrder));

