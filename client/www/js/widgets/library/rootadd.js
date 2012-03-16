/**
 * Root Adder Widget
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, services) {
    //////////////////////////////
    // Static event handlers

    // called on clicking the add button
    function onAdd(event, options) {
        var self = options.button,
            $document = $(document),
            dirsel;

        function onCancel() {
            // releasing import button
            self.release();
        }

        function onOk() {
            // initiating folder import
            services.root.add(dirsel.selected(), function () {
                // releasing import button
                self.release();

                // reloading library
                widgets.media.load();
            });
        }

        // preparing import button for folder selector dialog
        self.prepare(onOk, onCancel);

        // creating and displaying folder selector dialog
        dirsel = widgets.dirsel();
        dirsel
            .render($('body'));
    }

    //////////////////////////////
    // Static event bindings

    var $document = $(document);

    $document
        .on('buttonClick', '.w_rootadd', onAdd);

    //////////////////////////////
    // Class

    widgets.rootadd = function () {
        var self = wraith.widget.create(widgets.button());

        //////////////////////////////
        // Control

        /**
         * Prepares button for displaying folder selection dialog.
         * @param onOk {function} Event handler for Ok
         * @param onCancel {function} Event hand,er for Cancel
         */
        self.prepare = function (onOk, onCancel) {
            // disabling 'add folder' button
            // preventing multiple directory selection windows
            self
                .disabled({'import': true})
                .render();

            // adding temporary event listeners
            $document
                .on('buttonCancel', '.w_dirsel', onCancel)
                .on('buttonOk', '.w_dirsel', onOk);
        };

        /**
         * Releases button restrictions.
         */
        self.release = function () {
            // re-enabling button
            self
                .disabled({'import': false})
                .render();

            // removing event handlers
            $document
                .off('buttonCancel', '.w_dirsel')
                .off('buttonOk', '.w_dirsel');
        };

        //////////////////////////////
        // Overrides

        self.init = function (elem) {
            elem.addClass('w_rootadd');
        };

        self.contents = function () {
            return [
                '<span class="caption" title="', "Add folder to library", '">', '</span>'
            ].join('');
        };

        return self;
    }();

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.services);

