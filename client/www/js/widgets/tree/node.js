/**
 * Tree Node Widget
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
    widgets.node = function (text, tree, path) {
        path = path || [];

        var self = wraith.widget.create(),
            json,
            expanded = false;

        //////////////////////////////
        // Getters, setters

        self.path = function () {
            return path;
        };

        self.text = function () {
            return text;
        };

        self.expanded = function () {
            return expanded;
        };

        self.json = function (value) {
            if (typeof value !== 'undefined') {
                json = value;
                return self;
            } else {
                return json;
            }
        };

        //////////////////////////////
        // Control

        /**
         * Toggles expanded / collapsed state.
         */
        self.toggle = function () {
            expanded = !expanded;
            return self
                .clear()
                .build()
                .render();
        };

        //////////////////////////////
        // Overrides

        // builds the node with subnodes as specified by json
        self.build = function () {
            var keys, i, key,
                lookup, order, // temp buffers
                tmp;

            if (json && expanded) {
                // obtaining sorted array of node names
                keys = [];
                for (key in json) {
                    if (json.hasOwnProperty(key)) {
                        keys.push(key);
                    }
                }

                // adding child widgets according to node names
                lookup = {};
                order = {};
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    tmp = tree.display(path.concat([key]));
                    order[key] = tree.order(path.concat([key])) || key;
                    if (typeof tmp === 'undefined') {
                        lookup[key] = key;
                    } else if (tmp !== false) {
                        lookup[key] = tmp;
                    }
                }

                keys.sort(function (a, b) {
                    a = order[a];
                    b = order[b];
                    return a > b ? 1 : a < b ? -1 : 0;
                });

                // adding child widgets according to node names
                self.clear();
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    tmp = lookup[key];
                    if (typeof tmp !== 'undefined') {
                        widgets.node(tmp, tree, path.concat([key]))
                            .json(json[key])
                            .appendTo(self);
                    }
                }
            }
            return self;
        };

        /**
         * Tells whether the current node is selected.
         * @returns {boolean}
         */
        function selected() {
            return tree.selected().join('/') === path.join('/');
        }

        self.html = function () {
            return [
                /*jslint white:false */
                '<li id="', self.id, '" class="',
                ['w_node', expanded ? 'expanded' : '', selected() ? 'selected' : ''].join(' '), '">',
                    '<span>',
                        '<span class="toggle"></span>',
                        '<span class="name">', text, '</span>',
                    '</span>',
                    '<ul>',
                        function () {
                            var result = [],
                                i;
                            for (i = 0; i < self.children.length; i++) {
                                result.push(self.children[i].html());
                            }
                            return result.join('');
                        }(),
                    '</ul>',
                '</li>'
                /*jslint white:true */
            ].join('');
        };

        return self;
    };

    //////////////////////////////
    // Static event handlers

    function onExpandCollapseClicked() {
        var $node = $(this).closest('.w_node'),
            node = wraith.lookup($node);

        // toggling expanded state of node
        $node = node.toggle();

        // triggering custom event on node
        $node.trigger('nodeExpandCollapse', {
            elem: $node,
            node: node
        });

        return false;
    }

    function onDirectorySelect() {
        // obtaining necessary objects (current node & tree)
        var $node = $(this).closest('.w_node'),
            node = wraith.lookup($node);

        // triggering custom event on node
        $node.trigger('nodeSelected', {
            elem: $node,
            node: node
        });

        return false;
    }

    //////////////////////////////
    // Static event bindings

    // any non-dead folder can be expanded
    // any folder can be selected
    $(document)
        .on('click', '.w_node:not(.dead) span.toggle', onExpandCollapseClicked)
        .on('click', '.w_node span.name', onDirectorySelect);

    return widgets;
}(app.widgets,
    jQuery,
    wraith);

