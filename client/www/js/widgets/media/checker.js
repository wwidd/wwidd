////////////////////////////////////////////////////////////////////////////////
// Select All - Select None widget
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    function onCheck(event, data) {
        var $this = $(this),
            self = wraith.lookup($this);

        $this
            .trigger('checkerChecked', {
                widget: self,
                state: data.state
            });
    }
    
    //////////////////////////////
    // Static event bindings

    $(document)
        .on('checkboxChecked', '.w_checker', onCheck);

    //////////////////////////////
    // Class

    widgets.checker = (function () {
        var self = wraith.widget.create(widgets.button()).idle(true),
            checkbox = widgets.checkbox();

        //////////////////////////////
        // Overrides

        self.build = function () {
            checkbox.appendTo(self);
            return self;
        };
        
        self.init = function (elem) {
            elem.addClass('w_checker');
            
            // controlling actions dropdown state
            // must be controlled when widget is re-drawn
            widgets.actions
                .disabled({checker: checkbox.state() === 'unchecked'})
                .render();
        };

        self.contents = function () {
            return checkbox.html();
        };
        
        return self;
    }());
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));

