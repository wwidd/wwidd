////////////////////////////////////////////////////////////////////////////////
// Video Library - Page
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $, wraith) {
    var
    
    // static event handlers
    recalcDims;
        
    widgets.page = function () {
        var self = {},
                pager,
                kinds;

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
                .onChange(recalcDims)
                .load()
                .render($('#media').empty());

            return self;
        };

        return self;
    }();
    
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
                
        // re-calculates and applies container dimensions
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
        
        $(window).resize(recalcDims);
    });
        
    return widgets;
})(app.widgets || {},
    jQuery,
    wraith);

