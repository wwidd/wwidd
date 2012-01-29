////////////////////////////////////////////////////////////////////////////////
// General Hint Display Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
    widgets.hints = function () {
        var self = wraith.widget.create(),
                hints = [],
                current = 0;

        //////////////////////////////
        // Getters / setters
        
        self.hints = function (value) {
            hints = value;
            current = Math.floor(Math.random() * hints.length);
            return self;
        };
        
        self.clear = function () {
            hints = [];
            current = 0;
            return self;
        };
        
        //////////////////////////////
        // Overrides

        self.init = function (elem) {
            // displaying or hiding hints depending on current hint count
            if (hints.length) {
                elem.show();
            } else {
                elem.hide();
            }
            
            // click handler for "next hint" button
            elem.find('a.next')
                .click(function () {
                    // taking and rendering next hint
                    current = (current + 1) % hints.length;
                    self.render();
                    return false;
                });
        };
        
        self.html = function () {
            return [
                '<div id="', self.id, '" class="hints">',
                '<span class="text">', hints[current], '</span>',
                '<span class="icon"></span>',
                '<a class="next" href="#" title="', "Next hint", '"></a>',
                '</div>'
            ].join('');
        };
        
        return self;
    }();
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith);

