/**
 * Media List
 *
 * Displays a set of media entries.
 * Available views:
 * - tile: grid of thumbnails
 * - list: list of compact rows
 *
 * Dispatches:
 * - mediaInvalidated: when contents of the media window have changed
 * - checkboxCheck: to select or deselect all media entries
 *
 * Captures:
 * - mediumChecked: for updating checked media registry
 * - selectAll: for selecting / deselecting all media entries
 */
/*global jQuery, wraith, document */
var app = app || {};

app.widgets = (function (widgets, $, wraith, model, services) {
    //////////////////////////////
    // Static event handlers

    /**
     * Selects or deselects all media entries
     * @param event {object} jQuery event.
     * @param data {object} Custom event data
     * @param data.mode {string} Selection mode. "select" or "deselect".
     */
    function onSelectAll(event, data) {
        var self = wraith.lookup($(this));

        // selecting / deselecting all items on page
        if (data.mode === 'select') {
            self.selectAll();
        } else {
            self.selectNone();
        }
    }

    /**
     * Fires when a media item has been checked
     * @param event {object} jQuery event.
     * @param data {object} Custom event data
     * @param data.mediaid {string} Identifier of affected media entry.
     * @param data.state {string} Checkbox state. "checked", "unchecked", or "mixed".
     */
    function onMediumChecked(event, data) {
        var self = wraith.lookup($(this));

        // registering (un)checked item
        if (data.state === 'checked') {
            self.selected[data.mediaid] = true;
        } else {
            delete self.selected[data.mediaid];
        }
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('selectAll', '.w_media', onSelectAll)
        .on('mediumChecked', '.w_media', onMediumChecked);

    //////////////////////////////
    // Class

    // association between library views and entry views
    var VIEW_ASSOC = {
        'list': 'compact',
        'tile': 'thumb'
    };

    widgets.media = (function () {
        var self = wraith.widget.create(),
            view = model.cookie.get('view') || 'list',
            lookup = {};

        self.selected = {};

        //////////////////////////////
        // Control

        /**
         * Retrieves UI of 'medium' widgets found inside current widget.
         * @returns {object} jQuery object.
         */
        function media() {
            return self.ui().find('.w_medium');
        }

        /**
         * Retrieves UI of all checkboxes found inside current widget.
         * @returns {object} jQuery object.
         */
        function checkboxes() {
            return self.ui().find('.w_checkbox');
        }

        /**
         * Retrieves UI of checked checkboxes found inside current widget.
         * @returns {object} jQuery object.
         */
        function checked() {
            return self.ui().find('.w_checkbox.checked');
        }

        /**
         * Resets registry of selected entries.
         */
        function resetSelected() {
            self.selected = {};
        }

        /** Resets media state */
        self.reset = function () {
            // emptying registry of selected entries
            resetSelected();

            // re-setting common medium state
            widgets.medium.reset();

            return self;
        };

        /** Selects all visible media entries. */
        self.selectAll = function () {
            resetSelected();

            // marking all medium widgets as selected
            media().each(function () {
                var medium = wraith.lookup($(this));
                self.selected[medium.mediaid()] = true;
            });

            // checking all related checkboxes
            checkboxes()
                .trigger('checkboxCheck', {state: 'checked'});

            return self;
        };

        /** Deselects all visible media entries. */
        self.selectNone = function () {
            resetSelected();

            // unchceking all related checkboxes
            checkboxes()
                .trigger('checkboxCheck', {state: 'unchecked'});

            return self;
        };

        /** Redraws tags and kinds only. */
        self.refreshTags = function () {
            // finalizing kinds
            widgets.kinds
                .build()
                .render();

            widgets.tagger
                .render();

            self.ui().trigger('mediaInvalidated');
        };

        self.refresh = function () {
            // indicating busy state
            widgets.library
                .busy(true)
                .render();

            // redrawing widgets
            widgets.pager
                .render();

            // finalizing library
            widgets.media
                .reset()
                .build()
                .render();

            // finalizing kinds
            widgets.kinds
                .build()
                .render();

            // redrawing checker
            widgets.checker
                .render();

            // removing busy state
            widgets.library
                .busy(false)
                .render();

            self.ui().trigger('mediaInvalidated');
        };

        /**
         * (Re-)loads library contents.
         * TODO: should be evented
         */
        self.load = function () {
            var $document = $(document),
                title = $document.attr('title').split(' - ')[0];

            // indicating busy state
            widgets.library
                .busy(true)
                .render();

            // loading video data
            model.Media.init(function () {
                // setting active library in page title
                $document.attr('title', title + ' - ' + widgets.library.name());

                // applying search text
                model.Media.search(widgets.search.text());

                // re-building discovery widget
                widgets.discovery
                    .build()
                    .render();

                // redrawing media
                self.refresh();
            });
            return self;
        };

        /** Sets disabled state of db widgets. */
        function disabled(value) {
            widgets.library
                .disabled({library: value})
                .render();
            widgets.rootadd
                .disabled({library: value})
                .render();
        }

        /**
         * Initiates polling of thumbnail generation process.
         */
        self.poll = function () {
            // disabling db widgets
            disabled(true);

            // polling background processes
            services.sys.poll('thumbnails', function (json) {
                // updating progress indicator
                widgets.progress
                    .progress(json.progress)
                    .render();

                // updating media data
                model.Media.update(json.load);

                // updating thumbnails
                var mediaid, medium;
                for (mediaid in json.load) {
                    if (json.load.hasOwnProperty(mediaid) && lookup.hasOwnProperty(mediaid)) {
                        // looking up widget
                        medium = lookup[mediaid];

                        // rendering media entry
                        medium.render();
                    }
                }

                // updating UI if necessary
                if (json.progress === -1) {
                    // re-enabling db widgets
                    disabled(false);
                }
            });
        };

        //////////////////////////////
        // Getters / setters

        self.view = function (value) {
            var i, child;
            if (typeof value !== 'undefined') {
                // setting view for library (self)
                view = value;

                // setting view for media widgets (children)                
                for (i = 0; i < self.children.length; i++) {
                    child = self.children[i];
                    if (child.view) {
                        child.view(VIEW_ASSOC[value]);
                    }
                }

                return self;
            } else {
                return view;
            }
        };

        //////////////////////////////
        // Overrides

        // initiates acquiring of video metadata (keywords, thumbnails, etc.)
        function thumbnails(page) {
            var mediaids = [],
                i,
                entry;

            // collecting entries with no hash
            // only previously processed media entries have hash
            for (i = 0; i < page.length; i++) {
                entry = page[i];
                if (!entry.hash.length) {
                    mediaids.push(entry.mediaid);
                }
            }

            // calling thumbnail service
            if (mediaids.length) {
                services.media.extract(mediaids.join(','), false, function () {
                    self.poll();
                });
            }

            return self;
        }

        self.build = function () {
            var page = model.Media.getPage(widgets.pager.currentPage(), widgets.pager.items()),
                i,
                control;

            // generating thumbnails if necessary
            thumbnails(page);

            // attaching new widgets to cleaned library
            self.clear();
            lookup = {};
            for (i = 0; i < page.length; i++) {
                // adding media widget to library
                control = widgets.medium(page[i].mediaid)
                    .view(VIEW_ASSOC[view]);
                control.appendTo(self);

                // storing widget reference for lookup by id
                lookup[page[i].mediaid] = control;
            }

            return self;
        };

        self.init = function ($elem) {
            $elem.trigger("mediaInvalidated");
        };

        self.html = function () {
            var result, i;
            if (self.children.length) {
                result = ['<div id="', self.id, '" class="', ['w_media', view].join(' '), '">'];
                for (i = 0; i < self.children.length; i++) {
                    result.push(self.children[i].html());
                }
                result.push('</div>');
            } else if (widgets.search.text().length) {
                result = [
                    '<span id="', self.id, '" class="warning nohits">',
                        '<span class="icon"></span>',
                        '<span>', "No videos match the criteria.", '</span>',
                    '</span>'
                ];
            } else {
                result = [
                    '<span id="', self.id, '" class="warning empty">',
                        '<span>', "This library is empty. Import a folder above with [+].", '</span>',
                        '<span class="icon"></span>',
                    '</span>'
                ];
            }
            return result.join('');
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.model,
    app.services));

