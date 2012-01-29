////////////////////////////////////////////////////////////////////////////////
// General Checkbox Control
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
    var
    
    STATE_VALUES = {
        'checked': 'checked',
        'mixed': 'mixed',
        'unchecked': 'unchecked'
    },
    
    STATE_CHANGES = {
        'checked': 'unchecked',
        'mixed': 'unchecked',
        'unchecked': 'checked'
    };
    
    widgets.checkbox = function () {
        var self = wraith.widget.create(),
            state = STATE_VALUES['unchecked'];
        
        //////////////////////////////
        // Getters, setters
        
        self.state = function (value) {
            if (STATE_VALUES.hasOwnProperty(value)) {
                state = value;
                return self;
            } else {
                return state;
            }
        };

        //////////////////////////////
        // Overrides

        self.html = function () {
            return [
                /*jslint white:false */
                '<span id="', self.id, '", class="w_checkbox ', state, '">',
                    '<div class="check"></div>',
                '</span>'
                /*jslint white:true */
            ].join('');
        };
        
        return self;
    };
    
    //////////////////////////////
    // Static event handlers

    function onClick() {
        var $this = $(this),
            $checkbox = $this.closest('.w_checkbox'),
            self = wraith.lookup($checkbox);

        if (!self.disabled()) {
            // changing checkbox state
            self.state(STATE_CHANGES[self.state()]);
            $checkbox = self.render();
            
            // triggering custom event
            $checkbox.trigger('checkboxCheck', {
                elem: $checkbox,
                widget: self,
                state: self.state()
            });
        }
        
        return false;
    }
    
    //////////////////////////////
    // Static event bindings
    
    $(document)
        .on('click', '.w_checkbox', onClick);
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith);

