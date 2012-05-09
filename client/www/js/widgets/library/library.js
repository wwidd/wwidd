/**
 * Library Control Panel
 *
 * Encloses widgets that have to do with libraries:
 * - library switcher
 * - root folder adder
 *
 * Captures:
 * - selectSelected: for switching to another library
 */
/*global document, flock, jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, state, services) {
    //////////////////////////////
    // Static event handlers

    /**
     * Fires when user selected a library from dropdown.
     * @param event {object} jQuery event object
     * @param data {object} Custom event data
     * @param data.item {number} Item index.
     * @param data.name {string} Item name.
     */
    function onSelectSelected(event, data) {
        var $this = $(this),
            self = wraith.lookup($this),
            select = self.dropdown().popup(),

            // library name
            name = data.name || select.option(data.item);

        // calling service that selects new library
        services.lib.select(name, function () {
            // setting caption
            self.dropdown()
                .caption(name)
                .collapse()
                .render();

            // item is null when adding library
            if (data.item === null) {
                // library was added, reloading library list
                self.dropdown().popup()
                    .reload();
            }

            // setting library in cache (and thus triggering an event)
            state.library(name);
        });

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('selectSelected', '.w_switcher', onSelectSelected);

    //////////////////////////////
    // Class

    var hints = [
        "Save a backup copy of your library before extensive changes.",
        "Delete a library by deleting its database file."
    ];

    widgets.library = (function () {
        var self = wraith.widget.create(),
            dropdown = widgets.dropdown()
                .popup(widgets.libsel),
            busy = false;

        //////////////////////////////
        // Initialization

        dropdown.hints = hints;

        //////////////////////////////
        // Routing

        self.disabled = function (value) {
            // disabled state is passed on to dropdown
            dropdown.disabled(value);
            return self;
        };

        //////////////////////////////
        // Getters, setters

        self.dropdown = function () {
            return dropdown;
        };

        self.name = function () {
            return dropdown.caption();
        };

        self.busy = function (value) {
            busy = value;
            return self;
        };

        //////////////////////////////
        // Overrides

        self.build = function () {
            widgets.rootadd.appendTo(self);
            dropdown.appendTo(self);

            return self;
        };

        self.init = function (elem) {
            // setting state
            if (busy || self.disabled()) {
                elem.find('button')
                    .prop('disabled', true);
            } else {
                elem.find('button')
                    .prop('disabled', false);
            }

            if (busy) {
                elem.find('.spinner')
                    .show();
            } else {
                elem.find('.spinner')
                    .hide();
            }
        };

        self.html = function () {
            return [
                '<span id="', self.id, '" class="w_switcher">',
                    '<span class="caption">Library:</span>',
                    dropdown.html(),
                    widgets.rootadd.html(),
                    '<span class="spinner"></span>',
                '</span>'
            ].join('');
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    app.state,
    app.services));

