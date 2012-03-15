/**
 * Editable Control
 *
 * Controls based on this class have typically two states: one for
 * displaying (default) and one for editing its value. The latter becomes
 * available when clicking on the display state.
 *
 * Despatches:
 * - hitsData: for updating 6 displaying hints in connection with current widget
 */
/*global document, jQuery, wraith, app */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    var click = 'click';    // event.type for clicking ('click' or 'touchend')

    //////////////////////////////
    // Static utility functions

    /**
     * Triggers hint data sender event on editable widget.
     * Must be called passing 'this', too.
     * @param $elem DOM element for the widget
     * @param hints {Array} Hint messages
     */
    function setHints($elem, hints) {
        $elem
            .trigger('hintsData', {
                widget: this,
                hints: hints
            });
    }

    //////////////////////////////
    // Static event handlers

    // 'click outside' handler
    function onClickOutside(event, self, elem) {
        if (!elem.find(event.target).length) {
            // handling actual click outside event
            self.toggle('display');

            // hiding hints
            setHints.call(self, elem, null);
        } else {
            // re-binding one time handler
            $('body').one(click, function (event) {
                onClickOutside(event, self, elem);
            });
        }
        return false;
    }

    function onClick(event) {
        click = event.type;

        // switching display w/ edit
        var self = wraith.lookup($(this)),
            elem = self.toggle('edit');

        // emulating a 'click outside' event
        $('body').one(click, function (event) {
            onClickOutside(event, self, elem);
        });

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_editable', onClick)
        .on('touchend', '.w_editable', onClick);

    //////////////////////////////
    // Class

    widgets.editable = function () {
        var self = wraith.widget.create(),
            mode = 'display';

        self.hints = widgets.editable.hints;

        //////////////////////////////
        // Utility functions

        // switches to mode / between modes
        self.toggle = function (value) {
            mode = value || {'display': 'edit', 'edit': 'display'}[mode];

            var elem = this.render(),
                that = this;

            if (value === 'edit') {
                // delegating focus to focus object
                elem.find('.focus')
                    .focus();

                // displaying hints
                setHints.call(this, elem, this.hints);

                // adding removal event
                $('body').one(click, function (event) {
                    onClickOutside(event, that, elem);
                });
            } else {
                // unbinding global 'clickoutside' handler(s)
                $('body').unbind(click);

                // hiding hints
                setHints.call(this, elem, null);
            }

            return elem;
        };

        //////////////////////////////
        // Overrides

        // constructs display representation
        self.display = null;

        // constructs editable representation
        self.edit = null;

        self.init = function (elem) {
            elem
                .addClass('w_editable')
                .addClass(mode);
        };

        self.html = function () {
            // generating html according to mode
            if (mode === 'edit') {
                return this.edit();
            } else {
                return this.display();
            }
        };

        return self;
    };

    //////////////////////////////
    // Static properties

    // hints associated with this widget
    widgets.editable.hints = [
    ];

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));
