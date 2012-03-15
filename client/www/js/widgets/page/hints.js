/**
 * General Hint Display Control
 *
 * Captures:
 * - hintsData: for displaying hints
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    /**
     * Fires when widget receives hints to display.
     * Array of hint text is stored in the 'hints' property of the 'data' argument.
     * @param event jQuery event object
     * @param data {Object} Custom event data (widget + hint messages)
     */
    function onHintsData(event, data) {
        var self = wraith.lookup($(this));

        if (data.hints && data.hints.length) {
            // assiging hint messages to widget
            self.hints(data.hints);
        } else {
            // clearing hints widget (messages and child widgets)
            self.clear();
        }
        self.render();

        return false;
    }

    /**
     * Fires when user clicks 'next hint' button.
     * Displays next message from available hints.
     */
    function onNextClicked() {
        var self = wraith.lookup($(this), '.w_hints');
        self
            .next()
            .render();

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('hintsData', '.w_hints', onHintsData)
        .on('click', '.w_hints a.next', onNextClicked);

    //////////////////////////////
    // Class

    widgets.hints = (function () {
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
        // Control

        /**
         * Sets next hint message to be displayed.
         */
        self.next = function () {
            // taking and rendering next hint
            current = (current + 1) % hints.length;
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
        };

        /*jslint white: true */
        self.html = function () {
            return [
                '<div id="', self.id, '" class="w_hints">',
                    '<span class="text">', hints[current], '</span>',
                    '<span class="icon"></span>',
                    '<a class="next" href="#" title="', "Next hint", '"></a>',
                '</div>'
            ].join('');
        };
        /*jslint white: false */

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));

