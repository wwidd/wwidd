/**
 * Search Index
 *
 * Builds and queries search tree.
 */
/*global flock */
var app = app || {};

app.model = function (model) {
    var ROOT_FULL = ['full'],           // cache root for string prefix search
        ROOT_WORD = ['word'],           // cache root for word prefix search
        RE_SPLIT_COLON = /\s*:\s*/,     // regex that splits along padded colons
        RE_SPLIT_CHAR = '',             // regex that splits along each character
        RE_SPLIT_WHITE = /\s+/,         // regex that splits along whitespace

        // search cache must not be evented
        cache = flock({}, {nolive: true, nochaining: true});

    model.search = {
        //////////////////////////////
        // Exposed privates

        cache: cache,

        //////////////////////////////
        // Control

        /**
         * Gets nodes matching search criteria.
         * @param prefix {string} Search term prefix.
         * @param [path] {string[]} Custom path between search term and affected cache node.
         * @returns {object[]} List of media entries.
         */
        get: function (prefix, path) {
            var full = prefix.toLowerCase();
            return cache.query(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat([null]).concat(path || ['tag']));
        },

        /**
         * Gets words from the search index matching the search term as prefix.
         * @param prefix {string} Search term prefix.
         * @param [includeTags] {boolean} Whether matching tags should be returned (or just matching words).
         * @returns {object[]|string[]}
         */
        word: function (prefix, includeTags) {
            var full = prefix.toLowerCase(),
                path = ROOT_WORD.concat(full.split(RE_SPLIT_CHAR)).concat([null, 'word', '*']);
            if (typeof includeTags === 'undefined') {
                return cache.query(path, {mode: flock.BOTH});
            } else {
                path.push('*');
                return cache.query(path, {mode: flock.KEYS});
            }
        },

        /**
         * Adds search terms to the search index.
         * @param term {string} Exact search term.
         * @param node {object} Custom cache node associated with search term.
         * @param path {string[]} Custom path between search term and affected cache node.
         */
        set: function (term, node, path) {
            path = path || ['tag'];

            var full = term.toLowerCase(),
                tmp = full.split(RE_SPLIT_COLON),
                name = tmp[0],
                names = name.split(RE_SPLIT_WHITE),
                i;

            // adding string prefix index
            cache.set(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path), node);

            // inclusion of full tag (w/o kind)
            if (names.length > 1) {
                names.push(tmp[0]);
            }

            // adding word prefix index
            for (i = 0; i < names.length; i++) {
                cache.set(ROOT_WORD
                    .concat(names[i].split(RE_SPLIT_CHAR))
                    .concat(['word', names[i], term])
                    .concat(path), node);
            }
        },

        /**
         * Removes search term from search index.
         * @param term {string} Exact search term.
         * @param [path] {string[]} Custom path between search term and affected cache node.
         */
        unset: function (term, path) {
            path = path || ['tag'];

            var full = term.toLowerCase(),
                tmp = full.split(RE_SPLIT_COLON),
                name = tmp[0],
                names = name.split(RE_SPLIT_WHITE),
                i;

            // removing string prefix nodes
            cache.unset(ROOT_FULL.concat(full.split(RE_SPLIT_CHAR)).concat(path));

            // inclusion of full search term (w/o kind)
            if (names.length > 1) {
                names.push(tmp[0]);
            }

            // removing word prefix nodes
            for (i = 0; i < names.length; i++) {
                cache.cleanup(ROOT_WORD
                    .concat(names[i].split(RE_SPLIT_CHAR))
                    .concat(['word', names[i], term])
                    .concat(path));
            }
        }
    };

    return model;
}(app.model || {});

