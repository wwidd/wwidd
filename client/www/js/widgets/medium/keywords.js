/**
 * Keywords Widget
 *
 * Displays video metadata such as duration, dimensions, codecs, etc.
 */
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, model) {
    widgets.keywords = function (mediaid) {
        var self = wraith.widget.create(),
            keywords,
            special = {},
            rest = {},
            compact = true;

        //////////////////////////////
        // Setters / getters

        self.compact = function (value) {
            compact = value;
            return self;
        };

        //////////////////////////////
        // Overrides

        // initializes lookup buffers
        function prepare() {
            keywords = model.Media.getById(mediaid).keywords || {};
            var key, keyword;
            for (key in keywords) {
                if (keywords.hasOwnProperty(key)) {
                    keyword = key.split(':');
                    rest[keyword.shift()] = keyword.join(':');
                }
            }
            special = {
                duration: rest.duration,
                dimensions: rest.dimensions
            };
            delete rest.duration;
            delete rest.dimensions;
            return self;
        }

        self.html = function () {
            var result = ['<div id="' + self.id + '" class="w_keywords">'],
                key;

            // initializing buffers
            prepare();

            // adding duration and dimensions
            result.push([
                '<span class="duration" title="', "duration", '">', special.duration || "N/A", '</span>'
            ].join(''));
            result.push([
                '<span class="dimensions" title="', "dimensions", '">',
                (/\d+[x:]\d+/).exec(special.dimensions) || "N/A", '</span>'
            ].join(''));

            // adding all else
            if (compact) {
                result.push('<ul class="details">');
                for (key in rest) {
                    if (rest.hasOwnProperty(key)) {
                        result.push('<li><span title="' + key + '">' + rest[key] + '</span></li>');
                    }
                }
                result.push('</ul>');
            } else {
                result.push('<div class="details">');
                result.push('<table>');
                for (key in rest) {
                    if (rest.hasOwnProperty(key)) {
                        result.push('<tr><td><span>' + key + '</span></td><td><span title="' + rest[key] + '">' + rest[key] + '</span></td></tr>');
                    }
                }
                result.push('</table>');
                result.push('</div>');
            }
            result.push('</div>');
            return result.join('');
        };

        return self;
    };

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.model);

