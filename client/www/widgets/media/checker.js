////////////////////////////////////////////////////////////////////////////////
// Select All - Select None widget
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    function onCheck(event, data) {
        // selecting / deselecting all items on page
        if (data.state === 'checked') {
            widgets.media.selectAll();
        } else {
            widgets.media.selectNone();
        }
        
        // controlling actions dropdown state
        widgets.actions
            .disabled({checker: data.state === 'unchecked'})
            .render();
    }
    
    //////////////////////////////
    // Static event bindings

    $(document)
        .on('checkboxCheck', '.w_checker', onCheck);

    //////////////////////////////
    // Class

    widgets.checker = function () {
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
            var $media = $('#' + widgets.media.id + ' .w_medium'),
                count = $media.find(':checked').length;
                    
            // determining widget state based on 
            if (count === $media.length && count > 0) {
                checkbox.state('checked');
            } else if (count === 0) {
                checkbox.state('unchecked');
            } else {
                checkbox.state('mixed');
            }
            
            return checkbox.html();
        };
        
        return self;
    }();
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith);

