/**
 * Library Selector Control
 *
 * Lists available libraries, with download link
 *
 * Despatches:
 * - selectSelected: when a new library is being added
 * - inProgress: when in-progress server processes are detected
 *
 * Captures:
 * - buttonClick: for adding new library item
 */
/*global document, jQuery, wraith, window, flock, jOrder */
var app = app || {};

app.widgets = (function (widgets, $, wraith, flock, jOrder, services) {
    //////////////////////////////
    // Static event handlers

    /**
     * Fires when user clicks on 'Add library' button
     * @param event {object} jQuery event.
     * @param options {object}
     * @param options.elem {object} jQuery object for button.
     */
    function onAddButtonClick(event, options) {
        var $button = options.elem,
            self = wraith.lookup($(this));

        // triggering event that selects
        self.relatedWidget().ui()
            .trigger('selectSelected', {
                widget: self,
                item: null,
                name: $button.siblings('input.new').val()
            });

        return false;
    }

    /**
     * Fires when user clicks on 'Save library' button
     */
    function onSaveClick() {
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

    /**
     * Fires when user enters text into 'new library name' field.
     * Controls disabled state of 'add library' button.
     */
    function onNewKeyUp() {
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
        .on('click', '.w_libsel a.save', onSaveClick)
        .on('keyup', '.w_libsel input.new', onNewKeyUp)
        .on('buttonClick', '.w_libsel', onAddButtonClick);

    //////////////////////////////
    // Class

    widgets.libsel = (function () {
        var base = widgets.select(),
            self = wraith.widget.create(base),
            button = widgets.button("Add");

        /**
         * Reloads library list and updates other widgets.
         * TODO: investigate going evented
         */
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
                    // broadcasting message to initiate polling
                    self.relatedWidget().ui()
                        .trigger('inProgress');
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
                self.relatedWidget()
                    .caption(self.option(selected))
                    .collapse()
                    .render();
            });

            return self;
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
            elem
                .addClass('w_libsel')
                .find('input.new').closest('li')
                    .addClass('new');
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

