/**
 * Basic Tag Operations
 */
var app = app || {};

app.model = function (model, services) {
    /**
     * Selects best hit from an array of tag entries passed.
     * @param hits {object[]} List of tag entries.
     * @returns {object} Tag entry with the highest 'count' property.
     */
    function bestHit(hits) {
        var max = Number.MIN_VALUE, pos,
            i, tmp;
        for (i = 0; i < hits.length; i++) {
            tmp = hits[i].count;
            if (tmp > max) {
                max = tmp;
                pos = i;
            }
        }
        return hits[pos];
    }

    /**
     * Finds single tag entry matching the submitted prefix.
     * @param prefix {string} Search term prefix.
     * @returns {object} Tag entry best matching the prefix.
     */
    function search(prefix) {
        return bestHit(model.search.matchingNodes(prefix, ['tag']));
    }

    model.tags = function () {
        return {
            /**
             * Retrieves single tag entry best matching the prefix.
             * @param prefix {string} Search term prefix.
             * @returns {string} Tag in "name:kind" format.
             */
            searchTag: function (prefix) {
                return (search(prefix) || {tag: ''}).tag;
            },

            /**
             * Retrieves single tag name best matching the prefix.
             * @param prefix {string} Search term prefix.
             * @returns {string} Tag name only.
             */
            // retrieves the first matching name (kind is ignored)
            searchName: function (prefix) {
                return (search(prefix) || {name: ''}).name;
            },

            /**
             * Searches for matching words in order of the tags they're in.
             * @param prefix {string} Search term prefix.
             * @returns {string} Tag name only.
             * TODO: should be re-written when flock supports .query() with callback
             */
            searchWord: function (prefix) {
                // obtaining matching tags
                var hits = model.search.matchingWords(prefix),
                    word,
                    result = [],
                    tag, count;
                for (word in hits) {
                    if (hits.hasOwnProperty(word)) {
                        // counting tags for word
                        count = 0;
                        for (tag in hits[word]) {
                            if (hits[word].hasOwnProperty(tag)) {
                                count += hits[word][tag].tag.count;
                            }
                        }
                        result.push({name: word, count: count});
                    }
                }
                return (bestHit(result) || {name: ''}).name;
            }
        };
    }();

    return model;
}(app.model,
    app.services);

