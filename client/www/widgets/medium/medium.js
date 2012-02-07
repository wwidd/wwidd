/**
 * Media Entry
 *
 * Single video entry.
 * Available views:
 * - compact: checkbox, filename, rater, and tagger widgets as a row
 * - thumb: checker, thumbnail, filename, and rater overlayed
 * - expanded: all widgets (checkbox, thumbnail, filename, rater, keywords, tagger)
 *
 * Dispatches:
 * - mediumExpanded: when medium was expanded
 * - mediumPlaybackStarted: when media playback has started
 */
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith, services, model) {
    var VIEWS = {
            'thumb': 'thumb',
            'compact': 'compact',
            'expanded': 'expanded'
        },
    
        // static properties
        lastOpen;               // widget reference to the last opened medium (thumb or compact to expanded)

    //////////////////////////////
    // Static event handlers

    function onClick() {
        var $elem = $(this).closest('.w_medium'),
            self = wraith.lookup($elem),
            expanded = self.expanded();

        if (expanded) {
            // starting playback
            self.play($elem);

            // triggering custom event
            $elem.trigger('meduimPlaybackStarted', {
                elem: $elem,
                widget: self
            });
        } else {
            // closing last opened entry
            if (lastOpen) {
                lastOpen
                    .expanded(false)
                    .render();
            }

            // flipping full state and re-rendering widget
            $elem = self
                .expanded(!expanded)
                .render();

            // saving reference to last opened entry
            lastOpen = self;

            // triggering custom event
            $elem.trigger('mediumExpanded', {
                elem: $elem,
                widget: self
            });
        }

        return false;
    }

    function onChecked() {
        var $this = $(this),
            $medium = $this.closest('.w_medium'),
            self = wraith.lookup($medium);

        // registering (un)checked item
        if ($this.is(':checked')) {
            widgets.media.selected[self.data.mediaid] = true;
        } else {
            delete widgets.media.selected[self.data.mediaid];
        }

        // refreshing main checker widget
        widgets.checker.render();
    }

    //////////////////////////////
    // Event bindings

    $(document)
        .on('click', '.w_medium div.thumb, .w_medium div.file, .w_medium div.play', onClick)
        .on('click', '.w_medium div.check > :checkbox', onChecked);

    //////////////////////////////
    // Class
    
    widgets.medium = function (mediaid) {
        var self = wraith.widget.create(),
        
            // flags
            view = 'thumb',
            expanded = null;

        self.data.mediaid = mediaid;

        // child widgets
        self.rater = null;
        self.tagger = null;
        self.keywords = null;
        
        //////////////////////////////
        // Getters / setters

        self.view = function (value) {
            if (typeof value !== 'undefined') {
                view = value;
                return self;
            } else {
                return view;
            }
        };
        
        // true or false
        self.expanded = function (value) {
            if (typeof value !== 'undefined') {
                expanded = value ? 'expanded' : null;
                return self;
            } else {
                return expanded ? true : false;
            }
        };
        
        //////////////////////////////
        // Business functions

        /**
         * Calls playback service
         * @param elem Medium DOM element
         */
        self.play = function (elem) {
            elem
                .siblings().removeClass('playing').end()
                .addClass('playing');
            services.media.play(mediaid);
            model.pagestate.lastPlayed = mediaid;
            return self;
        };

        /**
         * Tells whether this media entry is selected
         */
        self.selected = function () {
            return $('#' + self.id).find(':checked').length > 0;
        };
        
        //////////////////////////////
        // Overrides

        // builds widget structure
        self.build = function () {
            self.clear();
            
            // adding rater widget
            self.rater = widgets.rater(mediaid)
                .appendTo(self);
            
            // adding tagger widget to non-thumb views
            self.tagger = widgets.tagger(mediaid)
                .appendTo(self);
            
            // adding keywords widget
            self.keywords = widgets.keywords(mediaid)
                .appendTo(self);
            
            return self;
        };
        
        /*jslint white: true */
        self.html = function () {
            var row = model.media.getRow(mediaid);

            return [
                '<div id="', self.id, '" class="', 
                ['w_medium']
                    .concat(model.pagestate.lastPlayed === mediaid ? ['playing'] : [])
                    .concat(VIEWS[expanded || view] || [])
                .join(' '), '">',
                    
                // checkbox
                '<div class="check">',
                    '<input type="checkbox" ', widgets.media.selected.hasOwnProperty(mediaid) ? 'checked="checked" ' : '', '/>',
                '</div>',
                
                // file name
                '<div class="file">',
                    '<span title="', row.file, '">', row.file, '</span>',
                '</div>',
                
                // thumbnail
                expanded || view === 'thumb' ? [
                    '<div class="overlay"></div>',
                    '<div class="play"><div class="image"></div></div>',
                    '<div class="thumb">',
                    row.hash.length ?
                        ['<img src="/cache/', row.hash, '.jpg">'].join('') :
                        '<span class="spinner"></span>',
                    '</div>'
                ].join('') : '',
                
                // rater
                self.rater.html(),
                
                // keywords
                expanded ? self.keywords
                    .compact(view !== 'compact')
                    .html() : '',
                
                // tagger
                expanded || view === 'compact' ? self.tagger.html() : '',
                
                '</div>'
            ].join('');
        };
        /*jslint white: false */

        return self;
    };
    
    //////////////////////////////
    // Static methods

    /**
     * Resets medium memory
     */
    widgets.medium.reset = function () {
        lastOpen = null;
    };

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.services,
    app.model));

