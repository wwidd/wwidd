/**
 * Wwidd Page
 *
 * Despatches:
 * - selectAll: targeted to widgets.media, selects or deselects all media entries
 *
 * Captures:
 * - mediumExpanded: for recalculating page dimensions
 * - mediaInvalidated: for recalculating page dimensions
 * - libselSelected: when new library is selected
 *
 * Delegates:
 * - hintsData: for displaying hint messages, to 'hints' widget
 */
/*global document, flock, jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $, state, services, model) {
    //////////////////////////////
    // Static event handlers

    var recalcDims;

    $(function () {
        var $header = $('#header'),
            $footer = $('#footer'),
            $library = $('#library'),
            $media = $('#media'),
            $discovery = $('#discovery'),

            // volatile dimensions
            headerHeight = $header.outerHeight(),
            footerHeight = $footer.outerHeight(),
            headerPadding = $header.outerWidth() - $header.width();

        /** Re-calculates and applies container dimensions. */
        recalcDims = function () {
            var fullWidth = $library.width(),
                sideBarWidth = $discovery.width(),
                mediaHeight = $media.outerHeight(true);

            $media.css({
                top: headerHeight,
                left: sideBarWidth,
                width: fullWidth - sideBarWidth
            });

            $discovery.css({
                top: headerHeight,
                height: mediaHeight
            });

            $header.add($footer)
                .width(fullWidth - headerPadding);

            $library.css('height', headerHeight + mediaHeight + footerHeight);
            $footer.css('top', headerHeight + mediaHeight);
        };

        // reacts to window resizing
        $(window).resize(recalcDims);

        // reacting to media expansion
        $(document)
            .on('mediumExpanded', recalcDims)
            .on('mediaInvalidated', recalcDims);
    });

    /**
     * Fires when an individual media item is checked
     */
    function onMediumChecked() {
        var $this = $(this),
            $checkboxes = $this.find('.w_media .w_checkbox'),
            $checked = $checkboxes.filter('.checked'),
            $checker = $this.find('.w_checker .w_checkbox');

        // refreshing main checker widget
        $checker
            .trigger('checkboxCheck', {
            state: {0: 'unchecked', 1: 'checked'}[$checked.length / $checkboxes.length] || 'mixed'
        });

        // updating actions widget state
        widgets.actions
            .disabled({checker: $checked.length === 0})
            .render();
    }

    /**
     * Fires when checker widget is checked or unchecked
     * @param event {object} jQuery event.
     * @param data {object} Custom event data
     * @param data.state {string} Checked state. 'checked' or 'unchecked'.
     */
    function onCheckerChecked(event, data) {
        // triggering select all on media items
        $(this).find('.w_media')
            .trigger('selectAll', {mode: {'checked': 'select'}[data.state] || 'deselect'});

        // updating actions widget state
        widgets.actions
            .disabled({checker: data.state !== 'checked'})
            .render();
    }

    /**
     * Fires when a widget on the page wants to display its hints.
     * Delegates event to hints widget for processing.
     * @param event {object} jQuery event.
     * @param data {object} Custom event data
      */
    function onHintsData(event, data) {
        $('.w_hints')
            .trigger(event.type, data);
    }

    /**
     * Fires when an option was clicked in the actions dropdown.
     * @param event {object} jQuery event.
     * @param data {object} Custom event data
     * @param data.mediaids {string[]} List of selected mediaids.
     * @param data.option {string} Action identifier. "extract" or "remove".
     */
    function onActionsOptionSelected(event, data) {
        var mediaids = data.mediaids;

        switch (data.option) {
        case 'extract':
            services.media.extract(mediaids.join(','), true, function () {
                widgets.media.poll();
            });
            break;
        case 'remove':
            // calling deletion service
            // then reloading entire library
            services.media.del(mediaids.join(','), function () {
                model.media.unset(mediaids);
                widgets.media.refresh();
            });
            break;
        }
    }

    /**
     * Fires when page was changed.
     */
    function onPagerChanged() {
        // re-building media
        widgets.media
            .build()
            .render();

        // setting URL
        widgets.url.set();

        // re-rendering
        widgets.checker
            .render();
    }

    /**
     * Fires when current library has changed
     */
    function onLibraryChanged() {
        // resetting widget
        widgets.pager.reset();
        widgets.search.reset();
        widgets.url.set();

        // loading new library contents
        widgets.media.load();
    }

    /**
     * Fires when in-progress server processes are detected
     */
    function onInProgress() {
        // starting media polling
        widgets.media.poll();
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('mediumChecked', onMediumChecked)
        .on('checkerChecked', onCheckerChecked)
        .on('hintsData', onHintsData)
        .on('actionsOptionSelected', onActionsOptionSelected)
        .on('pagerChanged', onPagerChanged)
        .on('inProgress', onInProgress);

    state
        .on('library', flock.CHANGE, onLibraryChanged);

    //////////////////////////////
    // Class

    widgets.page = (function () {
        var self = {},
            pager;

        // initializes page
        self.init = function () {
            // initializing pager widget
            widgets.pager
                .build()
                .render($('#pager').empty());

            // adding search box to page
            widgets.search
                .render($('#search')
                .empty()
                .append('&nbsp;')); // helps vertical alignment

            // adding select all
            widgets.checker
                .render($('#checker').empty());

            // adding actions
            widgets.actions
                .build()
                .render($('#checker'));

            // adding select all
            widgets.view
                .build()
                .render($('#views').empty());

            // adding library switcher
            widgets.discovery
                .build()
                .render($('#discovery').empty());

            // adding library switcher
            widgets.library
                .build()
                .render($('#switcher').empty());

            // adding hints container to page
            widgets.hints
                .render($('#footer').empty());

            // adding progress indicator to page
            widgets.progress
                .render($('#footer'));

            // initializing and adding library to page
            widgets.media
                .load()
                .render($('#media').empty());

            return self;
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    app.model.State,
    app.services,
    app.model));

