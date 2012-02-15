/**
 * Library Selector Control
 *
 * Lists available libraries, with download link
 *
 * Captures:
 * - buttonClick: for adding new library item
 * - selectSelected: for switching to another library
 */
/*global document, jQuery, wraith, window, flock, jOrder */
var app = app || {};

app.widgets = (function (widgets, $, wraith, flock, jOrder, services) {
    //////////////////////////////
    // Static event handlers

    function onAddButtonClick(event, options) {
        var $button = options.elem,
            self = wraith.lookup($(this));

        self.select($button.siblings('input.new').val(), function () {
            self.reload();
        });

        return false;
    }

    function onSelectSelected(event, data) {
        var self = wraith.lookup($(this));
        self.select(self.options()[data.item]);
    }

    function onClick(event) {
        var $this = $(this),
            self = wraith.lookup($this, '.w_libsel');

        // saving library
        services.lib.save(
            self.options()[self.selectedItem()],
            $this.closest('.w_libsel')
                .find('iframe.download')
        );

        return false;
    }

    function onKeyUp() {
        var $this = $(this),
            self = wraith.lookup($this, '.w_libsel'),
            data = widgets.libsel.data,
            name = $this.val();

        // enabling add button
        self.button()
            .disabled({libsel: name.length <= 0 || data.hasOwnProperty(name)})
            .render();
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_libsel a.save', onClick)
        .on('keyup', '.w_libsel input.new', onKeyUp)
        .on('buttonClick', '.w_libsel', onAddButtonClick)
        .on('selectSelected', '.w_libsel', onSelectSelected);

    //////////////////////////////
    // Class

    widgets.libsel = (function () {
        var base = widgets.select(),
            self = wraith.widget.create(base),
            button = widgets.button("Add");

        // selects library and reloads its contents
        // - name: name of the library to select
        self.select = function (name, handler) {
            services.lib.select(name, function () {
                // TODO: use events

                // resetting widget
                widgets.pager.reset();
                widgets.search.reset();
                widgets.url.set();

                // loading new library contents
                widgets.media.load();

                // setting caption
                widgets.library.dropdown()
                    .caption(name)
                    .collapse()
                    .render();

                // calling custom handler
                if (typeof handler === 'function') {
                    handler();
                }
            });
        };

        // retrieving list of libraries
        self.reload = function () {
            services.lib.getall(function (json) {
                var processes = json.data.processes,
                    progress = processes.thumbnails.progress,
                    options = flock(json).mget('data.names.*').sort(),
                    selected,
                    i;

                // preserving library name lookup
                // TODO: use app level state object
                widgets.libsel.data = jOrder.join(options, {});

                for (i = 0; i < options.length; i++) {
                    if (options[i] === json.data.selected) {
                        selected = i;
                        break;
                    }
                }

                // detecting in-progress processes
                if (progress > 0) {
                    // TODO: use events
                    widgets.media
                        .poll();
                } else {
                    self.render();
                }

                // adding placeholder for new library
                options.push(null);

                // initializing list
                self
                    .options(options)
                    .selectedItem(selected);

                // setting caption
                // TODO: use events
                widgets.library.dropdown()
                    .caption(self.options()[selected])
                    .collapse()
                    .render();
            });
        };

        //////////////////////////////
        // Initialization

        // loading library list
        self.reload();

        //////////////////////////////
        // Getters, setters

        self.button = function () {
            return button;
        };

        //////////////////////////////
        // Overrides

        self.build = function () {
            button
                .disabled({libsel: true})
                .appendTo(self);

            return self;
        };

        self.item = function (i, item, selected) {
            if (item) {
                return [
                    selected ?
                        '<span class="caption">' + item + '</span>' :                   
                        '<a href="#!" class="caption">' + item + '</a>',
                    '<a href="#!" class="save" title="' + "Download" + '"></a>'
                ].join('');
            } else {
                return [
                    '<input type="text" class="new" />',
                    button.html()
                ].join('');
            }
        };

        self.init = function (elem) {
            base.init.apply(self, arguments);

            // decorating class
            /*jslint white: true */
            elem
                .addClass('w_libsel')
                .find('input.new').closest('li')
                    .addClass('new');
            /*jslint white: false */
        };

        self.contents = function () {
            return [
                '<iframe class="download" style="display:none;"></iframe>',
                base.contents.apply(self, arguments)
            ].join('');
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    flock,
    jOrder,
    app.services));

