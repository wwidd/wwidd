/**
 * Kind Selector Control
 *
 * Lets the user control what kind of tags are visible
 *
 * Despatches:
 * - mediaInvalidated: when kinds are selected or deselected
 */
/*global jQuery, wraith, flock */
var app = app || {};

app.widgets = (function (widgets, $, wraith, flock, model, cache) {
    var KIND_PREFIX = 'k';

    widgets.kinds = (function () {
        var self = wraith.widget.create(widgets.popup('dropdown')),
            hidden;

        //////////////////////////////
        // Utility functions

        /**
         * Converts array to lookup.
         * @param array {string[]} List of kind identifiers (format "k##") to be converted to lookup.
         * @returns {object} Lookup object.
         */
        function toLookup(array) {
            var i, result = {};
            for (i = 0; i < array.length; i++) {
                if (array[i].length >= KIND_PREFIX.length) {
                    result[array[i].substr(KIND_PREFIX.length)] = true;
                }
            }
            return result;
        }

        /**
         * Converts lookup to array.
         * @param lookup {object} Lookup to be converted to array.
         * @returns {string[]} List of kind identifiers (format "k##").
         */
        function toArray(lookup) {
            var result = [], key;
            for (key in lookup) {
                if (lookup.hasOwnProperty(key)) {
                    result.push(KIND_PREFIX + key);
                }
            }
            return result;
        }

        /**
         * Adjusts the hidden state of a particular kind.
         * TODO: make evented
         */
        function hiddenHandler(kind, state) {
            if (state) {
                delete hidden[kind];
            } else {
                hidden[kind] = true;
            }

            // saving cookie
            model.cookie.set('hiddenkinds', toArray(hidden).join(','));

            // custom callback
            widgets.tagger
                .render();

            // notifying media collection of change
            // so it can re-calculate dimensions
            self.ui()
                .trigger('mediaInvalidated');

            return self;
        }

        //////////////////////////////
        // Initialization

        // initializing hidden kinds
        hidden = toLookup((model.cookie.get('hiddenkinds') || '').split(','));

        //////////////////////////////
        // Getters / setters

        // gets the hidden property of a kind
        self.hidden = function (kind) {
            return hidden[kind];
        };

        //////////////////////////////
        // Overrides

        self.build = function () {
            var kinds = cache.mget(['kind', '*'], flock.KEYS).sort(),
                i,
                kind;
            self.clear();
            for (i = 0; i < kinds.length; i++) {
                kind = kinds[i];
                widgets.kind(kind, hiddenHandler).appendTo(self);
            }
            return self;
        };

        self.contents = function () {
            var result = ['<div class="kinds">'],
                i;
            for (i = 0; i < self.children.length; i++) {
                result.push(self.children[i].html());
            }
            result.push('</div>');
            return result.join('');
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    flock,
    app.model,
    app.cache));

