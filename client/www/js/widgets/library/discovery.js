/**
 * Discovery Widget
 */
/*global document, jQuery, wraith, flock */
var app = app || {};

app.widgets = function (widgets, $, wraith, model, cache) {
    var ORGANIZED_FIELDS = {
        'bitrate': 1,
        'dimensions': 1,
        'duration': 1
    };

    //////////////////////////////
    // Static event handlers

    /**
     * Selection event handler. Prohibits selection of non-filtering nodes.
     * @param event {object} jQuery object.
     * @param options {object}
     * @param options.node {object} Discovery node jQuery object.
     * TODO: filtering library on filtering nodes (with flock 0.2)
     */
    function onSelected(event, options) {
        var node = options.node,
            path = node.path(),
            depth = path.length;

        if (depth < 2 && path[0] === 'rating' ||
            depth < 2 && path[0] === 'kind' ||
            depth < 2 && path[0] === 'field') {
            //return false;
        } else {
            if (model.Media.filterStack(path)) {
                widgets.search.reset();
                widgets.pager.reset();
                widgets.media.refresh();
                widgets.url.set();
            }
        }
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('nodeSelected', '.w_discovery', onSelected);

    /**
     * Determines numeric value for entries for ordering against siblings.
     * @param path {string[]} Absolute datastore path.
     * @returns {number} Numeric order value associated with entry on path.
     */
    function order(path) {
        var depth = path.length,
            key = path[depth - 1],
            count = cache.get(path.concat(['count']));

        if (typeof count === 'number') {
            // ordering by count desc when node has count
            return 0 - count;
        } else if (depth === 1) {
            return {
                'rating': 1,
                'kind': 2,
                'field': 3
            }[key] || 10;
        } else {
            // ordering by node key in any other case
            return key;
        }
    }

    /**
     * Determines display sting for entry.
     * @param path {string[]} Absolute datastore path.
     * @returns {string|boolean} Display string or false
     * if display string cannot be determined.
     */
    function display(path) {
        var depth = path.length,
            text = path[depth - 1],
            count;

        switch (depth) {
        case 0:
            // topmost node
            return "full library";

        case 1:
            // first-level node "by ..."
            return {
                'rating': "by rating",
                'kind': "by tags",
                'field': "by metadata"
            }[text] || false;

        case 2:
            switch (path[0]) {
            case 'rating':
                text = text.length ? widgets.rater.html(text) : "[unrated]";
                break;
            case 'kind':
                return text ? widgets.tagedit.html(text, text) : "[uncategorized]";
            }
            break;

        case 3:
            if (path[0] === 'kind') {
                text = widgets.tagedit.html(text, path[1]);
            }
            break;
        }

        // third or lower level
        // cutting branches
        if (
            path[0] === 'rating' && depth > 2 ||
                path[0] === 'kind' && depth > 3 ||
                path[0] === 'field' && (
                    path[1] in ORGANIZED_FIELDS && depth > 4 ||
                        !(path[1] in ORGANIZED_FIELDS) && depth > 3)
            ) {
            return false;
        }

        // assessing count
        count = cache.get(path.concat(['count']));
        if (typeof count === 'number') {
            return text + '<span class="count">(' + count + ')</span>';
        }

        return false;
    }

    widgets.discovery = function () {
        var self = wraith.widget.create(),
            tree = widgets.tree()
                .display(display)
                .order(order)
                .simple(true);

        //////////////////////////////
        // Control

        /**
         * Rebuilds one of the main branches of the discovery tree.
         * @param type {string} Discovery branch identifier. "ratings" or "kinds".
         */
        function refreshBranch(type) {
            var root = tree.children[0],
                node;

            // whether discovery tree exists
            if (typeof root !== 'undefined') {
                // obtining reference to branch node
                node = root.children[{
                    'ratings': 0,
                    'kinds': 1
                }[type] || 0];

                if (typeof node !== 'undefined') {
                    // re-building and re-rendering node
                    node
                        .build()
                        .render();
                }
            }
        }

        /**
         * Wrapper method for refreshing the tag branch.
         */
        self.refreshTags = function () {
            refreshBranch('kinds');
        };

        /**
         * Wrapper method for refreshing the rating branch.
         */
        self.refreshRatings = function () {
            refreshBranch('ratings');
        };

        //////////////////////////////
        // Overrides

        self.build = function () {
            tree
                .json(cache.root)
                .appendTo(self);

            return self;
        };

        self.html = function () {
            return [
                '<div id=', self.id, ' class="w_discovery">',
                    tree.html(),
                '</div>'
            ].join('');
        };

        return self;
    }();

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.model,
    app.cache);

