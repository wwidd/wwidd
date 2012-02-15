/**
 * Library Control Panel
 *
 * Encloses widgets that have to do with libraries:
 * - library switcher
 * - root folder adder
 */
/*global jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith, services) {
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

        self.html = function () {
            return [
                '<span class="switcher" id="', self.id, '">',
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
    wraith,
    app.services));

