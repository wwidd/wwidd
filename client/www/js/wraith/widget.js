////////////////////////////////////////////////////////////////////////////////
// Base Class for Wraith Widgets
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var 

wraith = function (wraith, $) {
    var LAST_ID = 0,    // next widget id to be assigned
            COUNT = 0,    // total number of wraith attached
            LOOKUP = {};    // widget lookup (id -> widget)
    
    // generates a new, unique widget id
    wraith.id = function () {
        return 'w' + LAST_ID++;
    };
    
    wraith.LOOKUP = LOOKUP;
    
    // looks up a widget based on a jQuery object element
    wraith.lookup = function (elem, selector) {
        elem = selector ? elem.closest(selector) : elem;
        return LOOKUP[elem.attr('id')];
    };
    
    // getter for widget count
    wraith.count = function () {
        return COUNT;
    };
    
    // base widget class
    wraith.widget = function () {
        var id = wraith.id(),
        
        // hashtable containing references to disabling
        // sources and their imposed states
        disabled = {},
        
        self =  {
            //////////////////////////////
            // Members
            
            // properties
            id: id,                         // id is automatically assigned
            parent: null,               // parent widget
            children: [],               // child wraith
            data: [],                       // data associated with widget
    
            //////////////////////////////
            // Getters, setters

            ui: function () {
                return $('#' + this.id);
            },
            
            //////////////////////////////
            // Control
            
            // adds a child to the widget
            append: function (child) {
                this.children.push(child);
                child.parent = this;
                return this;
            },
            
            // removes widget and frees resources
            remove: function () {
                this.clear();
                if (LOOKUP.hasOwnProperty(this.id)) {
                    delete LOOKUP[this.id];
                    COUNT--;
                }
                return this;
            },
            
            // adds widget to parent as child
            appendTo: function (parent) {
                this.parent = parent;
                parent.children.push(this.build());
                return this;
            },
            
            // removes child wraith
            clear: function () {
                var children = this.children,
                        i;
                for (i = 0; i < children.length; i++) {
                    children[i].remove();
                }
                children.length = 0;
                return this;
            },
            
            // sets disable flag for diabling souce(s)
            // a widget may be disabled by many sources
            // - value: object containing flags indexed by source
            //   format: {source: bool}
            disabled: function (value) {
                var source;
                if (typeof value === 'undefined') {
                    // one source disables the widget
                    for (source in disabled) {
                        if (disabled.hasOwnProperty(source)) {
                            if (disabled[source] === true) {
                                return true;
                            }
                        }
                    }
                    // no disabling source means widget is enabled
                    return false;
                } else {
                    // adding sources to internal buffer
                    for (source in value) {
                        if (value.hasOwnProperty(source)) {
                            disabled[source] = value[source];
                        }
                    }
                    return this;
                }
            },
            
            // builds the widget
            // adds child widgets
            build: function () {
                var i;
                for (i = 0; i < this.children.length; i++) {
                    this.children[i].build();
                }
                return this;
            },

            //////////////////////////////
            // Overrides
            
            // initializes the widget
            // e.g. adding data, events, etc.
            init: null,
            
            // produces the widget's html
            html: function () {
                throw "Abstract";
            },
            
            // renders the widget
            // - parent: parent jQuery object
            render: function (parent, handler) {
                // initializing jQuery object from full widget markup
                var elem = $(this.html()),
                        target = this.ui(),
                        animated = arguments[0] === 'animated', 
                        dims = null;
                        
                // storing before-rendering dimensions
                if (animated) {
                    dims = {
                        before: {
                            width: target.width(),
                            height: target.height()
                        }
                    };
                }

                // adding widget to dom
                if (target.length) {
                    if (!LOOKUP.hasOwnProperty(this.id) || parent === null) {
                        // removing it when destroyed at widget level
                        // or want to remove explicitly
                        target.remove();
                        return;
                    } else {
                        // replacing when already exists
                        target.replaceWith(elem);
                    }
                } else if (parent && typeof parent === 'object') {
                    // appending to parent when doesn't exist yet
                    parent.append(elem);
                }

                // storing after-rendering dimensions
                if (animated) {
                    dims.after = {
                        width: elem.width(),
                        height: elem.height()
                    };
                }
                
                // applying instance-level events
                (function inner() {
                    var selector = '#' + this.id,
                            i, result;

                    // initializing children
                    // (must come before initializing self,
                    // since parent widgets may rely on children)
                    for (i = 0; i < this.children.length; i++) {
                        inner.call(this.children[i]);
                    }

                    // initializing self
                    if (typeof this.init === 'function') {
                        result = this.init(elem.is(selector) ? elem : elem.find(selector), {handler: handler, dims: dims});
                    } else {
                        result = true;
                    }
                    
                    return result;
                }.call(this));
                
                return parent || elem;
            }
        };
        
        // adding widget to lookup
        LOOKUP[id] = self;
        COUNT++;

        return self;
    };

    // creates a new widget
    wraith.widget.create = function (base) {
        var self = Object.create(base || wraith.widget());
        LOOKUP[self.id] = self;
        return self;
    };
    
    return wraith;
}(wraith || {},
    jQuery);
