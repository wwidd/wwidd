/**
 * Keyword Model Class
 */
/*global flock */
var app = app || {};

app.model = function (model, flock, cache) {
    var LOG2 = Math.log(2),
        RE_HHMMSSSS = /(\d\d):(\d\d):(\d\d)\.(\d\d)/;

    /**
     * Adds keyword to cache.
     * @param keyword {string} Keyword in "field:value" format.
     * @param ref {object} Reference to cache node holding keyword value.
     * @param ref.field {string} Keyword field.
     * @param ref.value {string} Keyword value.
     */
    function add(keyword, ref) {
        // adding node to cache
        cache.set(['keyword', keyword], ref);

        var tmp;

        // adding node to field index
        switch (ref.field) {
        case 'bitrate':
            // calculating two nearest powers of 2
            tmp = parseInt(ref.value.split(' ').shift(), 10);
            tmp = Math.floor(Math.log(tmp) / LOG2);
            cache.set(['field', ref.field, Math.pow(2, tmp) + ' - ' + Math.pow(2, tmp + 1), ref.value], ref);
            break;

        case 'dimensions':
            // getting y dimension
            tmp = parseInt(ref.value.split(' ').shift().split('x')[1], 10);
            tmp = tmp >= 1080 ? "Full HD" :
                tmp >= 720 ? "HD" :
                    tmp >= 480 ? "SD" :
                        "LR";
            cache.set(['field', ref.field, tmp, ref.value], ref);
            break;

        case 'duration':
            // calculating seconds
            tmp = ref.value.match(RE_HHMMSSSS);
            tmp = parseInt(tmp[1], 10) * 3600 + parseInt(tmp[2], 10) * 60 + parseInt(tmp[3], 10);
            if (tmp > 3600) {
                tmp = "> 1 hour";
            } else if (tmp > 1800) {
                tmp = "30 - 60 mins";
            } else if (tmp > 600) {
                tmp = "10 - 30 mins";
            } else if (tmp > 300) {
                tmp = "5 - 10 mins";
            } else if (tmp > 60) {
                tmp = "1 - 5 mins";
            } else {
                tmp = "< 1 min";
            }
            cache.set(['field', ref.field, tmp, ref.value], ref);
            break;

        default:
            cache.set(['field', ref.field, ref.value], ref);
            break;
        }
    }

    model.keyword = {
        /**
         * Retrieves keyword node from cache or creates keyword node and
         * stores it in cache.
         * @param keyword {string} Keyword in "field:value" format.
         */
        get: function (keyword) {
            var path = ['keyword', keyword],
                ref = cache.get(path),
                tmp;

            if (typeof ref === 'undefined') {
                // creating node
                tmp = keyword.split(':');
                ref = {
                    keyword: keyword,
                    field: tmp.shift(),
                    value: tmp.join(':'),
                    media: {},
                    count: 0
                };

                // adding node to cache
                add(keyword, ref);
            }

            return ref;
        }
    };

    return model;
}(app.model || {},
    flock,
    app.cache);

