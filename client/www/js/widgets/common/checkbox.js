/**
 * General Checkbox Control
 *
 * Dispatches:
 * - checkboxChecked: when checkbox was checked or unchecked
 *
 * Captures:
 * - checkboxCheck: for checking or unchecking checkbox
 */
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    var STATE_VALUES = {
            'checked': 'checked',
            'mixed': 'mixed',
            'unchecked': 'unchecked'
        },

        STATE_CHANGES = {
            'checked': 'unchecked',
            'mixed': 'unchecked',
            'unchecked': 'checked'
        };

    //////////////////////////////
    // Static event handlers

    /**
     * Fires when checkbox is clicked by user
     */
    function onClick() {
        var $this = $(this),
            $checkbox = $this.closest('.w_checkbox'),
            self = wraith.lookup($checkbox);

        if (!self.disabled()) {
            // changing checkbox state
            self.state(STATE_CHANGES[self.state()]);   // state flips
            $checkbox = self.render();

            // triggering custom event
            $checkbox.trigger('checkboxChecked', {
                widget: self,
                state: self.state()
            });
        }

        return false;
    }

    /**
     * Fires when checkbox is checked by another widget
     * @param event jQuery event object
     * @param data custom event data {state: 'checked' / 'unchecked' / 'mixed'}
     */
    function onCheck(event, data) {
        var $this = $(this),
            $checkbox = $this.closest('.w_checkbox'),
            self = wraith.lookup($checkbox);

        if (!self.disabled()) {
            // changing checkbox state
            self
                .state(STATE_VALUES[data.state])
                .render();
        }

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_checkbox', onClick)
        .on('checkboxCheck', '.w_checkbox', onCheck);

    //////////////////////////////
    // Class

    widgets.checkbox = function () {
        var self = wraith.widget.create(),
            state = STATE_VALUES.unchecked;
        
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

        /*jslint white:true */
        self.html = function () {
            return [
                '<span id="', self.id, '" class="w_checkbox ', state, '">',
                    '<div class="check"></div>',
                '</span>'
            ].join('');
        };
        /*jslint white:false */

        return self;
    };
    
    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));

