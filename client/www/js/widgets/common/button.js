/**
 * General Button Widget
 */
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    function onClick() {
        var $this = $(this),
            $button = $this.closest('.w_button'),
            self = wraith.lookup($button);

        // triggering custom event
        if (!self.disabled()) {
            $button.trigger('buttonClick', {
                elem: $button,
                button: self
            });
        }

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_button', onClick);

    //////////////////////////////
    // Class

    widgets.button = function (caption) {
        var self = wraith.widget.create(),
            idle = false;
            
        //////////////////////////////
        // Getters / setters

        self.caption = function (value) {
            if (typeof value === 'string') {
                caption = value;
                return this;
            } else {
                return caption;
            }
        };

        self.idle = function (value) {
            if (typeof value === 'boolean') {
                idle = value;
                return this;
            } else {
                return idle;
            }
        };
        
        //////////////////////////////
        // Overrides

        self.contents = null;
        
        self.html = function () {
            return [
                '<span id="', this.id, '" class="w_button ', idle ? 'idle' : '', '" ', this.disabled() ? 'disabled="disabled"' : '', '>',
                this.contents ?
                    this.contents() :
                    '<span class="caption">' + (caption || '') + '</span>',
                '</span>'
            ].join('');
        };
        
        return self;
    };
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));

