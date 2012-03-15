/**
 * General Selector Popup Widget
 *
 * Selector list part of a dropdown.
 *
 * Behavior:
 * - There must be a .caption element inside each item.
 *   That will intercept select events.
 * - Selected items don't trigger events.
 * - Widget can be stateful or stateless. When stateful, it
 *   preserves information about the selected item.
 *
 * Dispatches:
 * - selectSelected: when an item is selected
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    function onClick(event) {
        var $this = $(this),
            $item = $this.closest('li'),
            $popup = $item.closest('.w_popup'),
            i = $item.index(),
            self = wraith.lookup($popup);

        // setting selected item on widget
        self.selectedItem(i);

        // firing custom event saying an item was selected
        $popup.add(self.relatedWidget().ui())
            .trigger('selectSelected', {
                widget: self,
                item: i
            });
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_select > li:not(.selected) > .caption', onClick);

    //////////////////////////////
    // Class

    widgets.select = function (options) {
        var self = wraith.widget.create(widgets.popup('dropdown')),
            stateful = true,    // whether widget remembers last selected item
            selectedItem = 0;   // selected index

        //////////////////////////////
        // Getters, setters

        self.stateful = function (value) {
            stateful = value;
            return self;
        };

        self.selectedItem = function (value) {
            if (typeof value === 'number') {
                selectedItem = value;
                return self;
            } else {
                return selectedItem;
            }
        };

        self.options = function (value) {
            if (typeof value === 'object') {
                options = value;
                return self;
            } else {
                return options;
            }
        };

        self.option = function (index) {
            return options[index];
        };

        //////////////////////////////
        // Overrides

        self.item = null;

        self.contents = function () {
            var result, i;

            result = ['<ul class="w_select">'];
            if (options) {
                for (i = 0; i < options.length; i++) {
                    result.push([
                        '<li', stateful && i === selectedItem ? ' class="selected"' : '', '>',
                        typeof this.item === 'function' ?
                            this.item(i, options[i], stateful && i === selectedItem) :
                            '<span class="caption">' + options[i] + '</span>',
                        '</li>'
                    ].join(''));
                }
            }
            result.push('</ul>');
            
            return result.join('');
        };

        return self;
    };

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith));

