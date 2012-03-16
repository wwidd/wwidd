/**
 * General Dropdown Widget
 *
 * Captures:
 * - buttonClick: for controlling dropdown state (expanded / collapsed)
 */
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    function onClick() {
        var self = wraith.lookup($(this));

        // checking if popup is already up
        if (self.expanded()) {
            self.collapse();
        } else {
            self.expand();
        }

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('buttonClick', '.w_dropdown', onClick);

    //////////////////////////////
    // Class

    widgets.dropdown = function (caption) {
        var base = widgets.button(caption),
            self = wraith.widget.create(base),
            expanded = false,
            popup;

        //////////////////////////////
        // Getters / setters

        self.popup = function (value) {
            if (typeof value === 'object') {
                popup = value;

                // setting dropdown as related widget for popup
                // so the popup's events may be fired on the dropdown, too
                popup.relatedWidget(this === window ? self : this);
                return self;
            } else {
                return popup;
            }
        };

        self.expanded = function (value) {
            if (typeof value === 'boolean') {
                expanded = value;
                return self;
            } else {
                return expanded;
            }
        };

        //////////////////////////////
        // Control

        function setHints($elem, hints) {
            $elem
                .trigger('hintsData', {
                widget: self,
                hints: hints
            });
        }

        // expands the dropdown widget
        self.expand = function () {
            // re-rendering UI
            var $this = self
                .expanded(true)
                .render();

            // showing popup
            popup
                .anchor($this)
                .build()
                .render($('body'));

            // sending hint messages
            setHints($this, self.hints || []);
        };

        // collapses the dropdown widget
        self.collapse = function () {
            // clearing hints
            setHints(self.ui(), null);

            // hiding dropdown window
            popup
                .render(null);

            // re-drawing self (for changing the arrow)
            self
                .expanded(false)
                .render();

            return self;
        };

        //////////////////////////////
        // Overrides

        self.disabled = function (value) {
            var before = base.disabled.call(self),
                result = base.disabled.call(self, value),
                after = base.disabled.call(self);

            // collapsing widget when just got disabled
            if (after && !before) {
                self.collapse();
            }

            return result;
        };

        self.init = function (elem) {
            elem.addClass('w_dropdown');
            if (expanded) {
                elem.addClass('open');
            } else {
                elem.removeClass('open');
            }
        };

        self.contents = function () {
            return [
                '<span class="caption">', self.caption(), '</span>',
                '<span class="indicator"></span>'
            ].join('');
        };

        return self;
    };

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));

