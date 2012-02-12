////////////////////////////////////////////////////////////////////////////////
// URL
//
// Gets or sets browser URL according to search terms
////////////////////////////////////////////////////////////////////////////////
/*global window */
var app = app || {};

app.widgets = (function (widgets) {
    // sets ajax URL in browser
    function refresh(values) {
        window.location.hash = '#!/' + values.join('/') + '/';
    }
    
    widgets.url = {
        get: function () {
            // obtaining URL hash values
            var tmp = decodeURI(window.location.hash).split('/'),
				library = '',       // placeholder for library name
				filter = tmp[2] || '',
				page = parseInt(tmp[3], 10) || 1;
            
            // updating widget state
            widgets.search.text(filter);
            widgets.pager.currentPage(page - 1);
            
            // sanitizing URL
            refresh([library, filter, page]);
        },
        
        set: function () {
            refresh([null, widgets.search.text() || '', (parseInt(widgets.pager.currentPage(), 10) || 0) + 1]);
        }
    };
    
    // initializing widgets according to URL
    widgets.url.get();
    
    return widgets;
}(app.widgets || {}));

