////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
var app = app || {};

app.model = function (model, services) {
    // selects best hit from an array of hits passed
    // simple maximum search
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
    
    // searches for a tag entry associated with the term
    // start-of-word search
    function search(term) {
        return bestHit(model.search.get(term, ['tag']));
    }
                    
    model.tags = function () {
        var self = {
            // retrieves the first matching tag to a search term
            searchTag: function (term) {
                return (search(term) || {tag: ''}).tag;
            },
            
            // retrieves the first matching name (kind is ignored)
            searchName: function (term) {
                return (search(term) || {name: ''}).name;
            },
            
            // searches matching words in order of the tags they're a part of
            // NOTE: should be re-written when flock supports mget() with callback
            searchWord: function (term) {
                // obtaining matching tags
                var hits = model.search.word(term),
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

        return self;
    }();
    
    return model;
}(app.model,
    app.services);

