/**
 * Library Control Panel
 *
 * Encloses widgets that have to do with libraries:
 * - library switcher
 * - root folder adder
 *
 * Despatches:
 * - libselSelected: when a library is selected from the list
 *
 * Captures:
 * - selectSelected: for switching to another library
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith, services) {
    //////////////////////////////
    // Static event handlers

    /**
     * Fires when user selected a library from dropdown.
     * @param event jQuery event object
     * @param data {Object} Custom event data holding item number
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

            // triggering custom event telling that
            // library was changed
            self.ui()
                .trigger('libselSelected', {
                    widget: self,
                    item: data.item,
                    name: name
                });
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
        
        // disabled method is passed on to dropdown
        self.disabled = function (value) {
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

        /*jslint white: true */
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
        /*jslint white: false */
        
        return self;
    }());
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.services));

