/**
 * Pager Control
 *
 * For switching between pages
 *
 * Despatches:
 * - pagerChanged: When new page was selected
 *
 * Captures:
 * - pageChange: for changing pages by external widgets
 */
/*global jQuery, wraith, document */
var app = app || {};

app.widgets = (function (widgets, $, wraith, model) {
    //////////////////////////////
    // Static event handlers

    /**
     * Modifies page number according to method.
     * Returns false when page number was not changed.
     * @param page Either string ('next', 'prev', 'first', or 'last') or a number
     * representing the page to set
     */
    function setPage(page) {
        if (typeof page === 'string') {
            // could be written in a single line, but this way it's more readable
            switch (page) {
            case 'next':
                return this.next();
            case 'prev':
                return this.prev();
            case 'first':
                return this.first();
            case 'last':
                return this.last();
            }
        } else if (typeof page === 'number') {
            return this.currentPage(page);
        }
    }

    /**
     * Refreshes page to reflect the current state and finishes.
     */
    function changePage() {
        // re-rendering pager widget
        this
            .render();

        // triggering changed event
        this.ui()
            .trigger('pagerChanged', {
                widget: this,
                page: this.currentPage()
            });

        // TODO: these should be handled in their respecive classes
        widgets.media
            .build()
            .render();
        widgets.url.set();
        widgets.checker
            .render();
    }

    function onClick() {
        var $this = $(this),
            $pager = $this.closest('.w_pager'),
            self = wraith.lookup($pager);

        // turning pages based on which button was clicked
        if (setPage.call(self, $this.attr('data-method'))) {
            changePage.call(self);
        }

        return false;
    }

    /**
     * External control for changing pages
     * @param event jQuery event
     * @param data Object containing method or page (number) parameter
     */
    function onPageChange(event, data) {
        var $this = $(this),
            self = wraith.lookup($this);

        // turning pages
        if (setPage.call(self, data.method || data.page)) {
            changePage.call(self);
        }
    }

    /**
     * Fires when the user presses any of the page navigation buttons
     * @param event jQuery event
     */
    function onKeyDown(event) {
        // excluding input controls
        if ($(event.target).is('input')) {
            return;
        }

        // handling special keys
        $('.w_pager')
            .trigger('pageChange', {
                method: {
                    36: 'first',	// home
                    34: 'next',		// next
                    33: 'prev',		// prev
                    35: 'last'      // end
                }[event.which]
            });
    }

    /**
     * Fires when a page is selected from the page selector dropdown
     * @param event jQuery event object
     * @param data Custom data object {item: number}
     */
    function onSelectSelected(event, data) {
        var self = wraith.lookup($(this));

        // collapsing dropdown
        self.button()
            .collapse()
            .render();

        // triggering page change
        self.ui()
            .trigger('pageChange', {page: data.item});
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_pager .button', onClick)
        .on('pageChange', '.w_pager', onPageChange)
        .on('keydown', onKeyDown)
        .on('selectSelected', '.w_pager', onSelectSelected);

    //////////////////////////////
    // Class

    widgets.pager = (function () {
        var self = wraith.widget.create(),
            select = widgets.select(),
            button = widgets.dropdown()
                .popup(select),
            currentPage = 0,
            itemsPerPage = 20,
            pageCount = 0;

        //////////////////////////////
        // Getters, setters

        self.currentPage = function (value) {
            if (typeof value === 'number') {
                if (currentPage !== value) {
                    currentPage = value;
                    return self;
                } else {
                    // page number was not set
                    return false;
                }
            } else {
                return currentPage;
            }
        };

        self.items = function () {
            return itemsPerPage;
        };

        self.button = function () {
            return button;
        };

        //////////////////////////////
        // Utility functions

        /**
         * Resets current page number.
         */
        self.reset = function () {
            currentPage = 0;
            select.selectedItem(currentPage);
            return self;
        };

        /**
         * Assembles page list as options for pager dropdown
         */
        function getOptions() {
            var result = [],
                row,
                i;
            pageCount = model.media.getPages(itemsPerPage);
            for (i = 0; i < pageCount; i++) {
                row = model.media.getFirst(i, itemsPerPage)[0];
                result.push((i + 1) + " - " + row.file.substr(0, 8) + "...");
            }
            return result;
        }

        //////////////////////////////
        // External control

        self.first = function () {
            if (currentPage > 0) {
                currentPage = 0;
                return self;
            } else {
                return false;
            }
        };

        self.prev = function () {
            if (currentPage > 0) {
                currentPage--;
                return self;
            } else {
                return false;
            }
        };

        self.next = function () {
            if (currentPage < pageCount - 1) {
                currentPage++;
                return self;
            } else {
                return false;
            }
        };

        self.last = function () {
            if (currentPage < pageCount - 1) {
                currentPage = pageCount - 1;
                return self;
            } else {
                return false;
            }
        };

        //////////////////////////////
        // Overrides

        self.build = function () {
            select
                .selectedItem(currentPage)
                .appendTo(self);
            button
                .appendTo(self);

            return self;
        };

        self.html = function () {
            // re-rendering the select dropdown
            select
                .options(getOptions())
                .render();

            // returning empty widget on no data
            if (select.options().length <= 1) {
                return '<span id="' + self.id + '"></span>';
            }

            button
                .caption(select.options()[currentPage]);

            // re-setting page in case pager is out of bounds
            if (currentPage > pageCount) {
                currentPage = 0;
            }

            /*jslint white: true */
            var retval = [
                '<span class="w_pager" id="' + self.id + '">',
                    '<a class="button first" data-method="first" href="#" title="First"></a>',
                    '<a class="button prev" data-method="prev" href="#" title="Previous"></a>',
                    button.html(),
                    '<a class="button next" data-method="next" href="#" title="Next"></a>',
                    '<a class="button last" data-method="last" href="#" title="Last"></a>',
                '</span>'
            ].join('');
            /*jslint white: false */

            return retval;
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.model));

