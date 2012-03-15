/**
 * Directory Selector Widget
 *
 * Encompasses a tree widget designed specifically to display directories
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = (function (widgets, $, wraith, services) {
    //////////////////////////////
    // Static event handlers

    // directory selection handler
    function onSelected(event, options) {
        var $node = options.elem,
            self = wraith.lookup($node, '.w_popup');
                
        self.btnOk()
            .disabled({self: false})
            .render();
    }
    
    // directory expand / collapse handler
    // loads child directories on demand
    function onExpandCollapse(event, options) {
        var $node = options.elem,
            node = options.node,
            expanded = node.expanded(),
            empty = Object.isEmpty(node.json()),
            $spinner;
    
        // acquiring sub-nodes when expanding an empty node
        if (expanded && empty) {
            /*jslint white: true */
            $spinner = $node
                .closest('.w_popup')
                    .find('.spinner')
                        .show();
            /*jslint white: false */

            services.sys.dirlist(node.path().join('/'), function (json) {
                $spinner.hide();
                empty = Object.isEmpty(json.data);
                if (empty) {
                    // no subdirs, removing expand button
                    $node
                        .removeClass('expanded')
                        .addClass('dead');
                } else {
                    // has subdirs, creating child nodes
                    node
                        .json(json.data)
                        .build()
                        .render();
                }
            });
        }
    }

    // button click handler
    // delegates event further 
    function onButton(event, options) {
        var $this = $(this),
            self = wraith.lookup($this);
        
        // determining which button was clicked
        switch (options.button.id) {
        case self.btnOk().id:
            $this.trigger('buttonOk', options);
            break;
        case self.btnCancel().id:
            $this.trigger('buttonCancel', options);
            break;
        }

        // removing dialog
        self
            .remove()
            .render();

        return false;
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('nodeExpandCollapse', '.w_dirsel', onExpandCollapse)
        .on('nodeSelected', '.w_dirsel', onSelected)
        .on('buttonClick', '.w_dirsel', onButton);
    
    //////////////////////////////
    // Class

    widgets.dirsel = function () {      
        var base = widgets.popup('centered'),
            self = wraith.widget.create(base),
            tree = widgets.tree(),
            btnCancel = widgets.button("Cancel"),
            btnOk = widgets.button("OK").disabled({self: true});
        
        // initial service call for root dirs
        services.sys.dirlist(null, function (json) {
            // initial tree contents
            tree
                .json(json.data)
                .appendTo(self);
                
            // re-rendering entire widget
            /*jslint white: true */
            self
                .render()
                .find('div.spinner')
                    .hide();
            /*jslint white: false */
        });

        //////////////////////////////
        // Setters / getters

        self.btnOk = function () {
            return btnOk;
        };

        self.btnCancel = function () {
            return btnCancel;
        };
        
        self.selected = function () {
            return '/' + tree.selected().join('/');
        };
        
        //////////////////////////////
        // Overrides

        self.build = function () {
            btnOk.appendTo(self);
            btnCancel.appendTo(self);
            return self;
        };
        
        self.init = function (elem) {
            /*jslint white: true */
            elem
                .addClass('w_dirsel')
                .find('div.spinner')
                    .show()
                .end()
                .find('table.status')
                    .insertAfter(elem.find('ul.root'));
            /*jslint white: false */
                    
            // calling base init at the END
            // because base init relies on final dimensions
            base.init.apply(self, arguments);
        };
        
        self.contents = function () {
            return [
                '<div class="spinner"></div>',
                '<span class="title">', "Add folder to library", '</span>',
                tree.html(),
                btnOk.html(),
                btnCancel.html()
            ].join('');
        };
        
        return self;
    };
    
    return widgets;
}(app.widgets,
    jQuery,
    wraith,
    app.services));

