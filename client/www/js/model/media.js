/**
 * Media Model
 */
/*global jOrder, flock, escape */
var app = app || {};

app.model = function (model, jOrder, flock, cache, services) {
    /**
     * Extracts filename from path.
     * @param path {string} Filesystem path.
     * @returns {string} Filename.
     */
    function splitPath(path) {
        var bits = path.split('/');
        return {
            file: bits.pop()
        };
    }

    /**
     * Preprocesses file paths.
     * Injects file names and lowercase file names
     * into input array.
     * @param fileDescriptors {string[]} List of file name descriptiors.
     * @returns {string[]} Modified list of file name descriptiors,
     */
    function preprocess(fileDescriptors) {
        var i, row, fileInfo;
        for (i = 0; i < fileDescriptors.length; i++) {
            row = fileDescriptors[i];
            fileInfo = splitPath(row.path);
            row.file = fileInfo.file;
            row.lfile = fileInfo.file.toLowerCase();
        }
        return fileDescriptors;
    }

    var

        // container for unfiltered data
        unfiltered = {
            cache: null,
            json: null
        },

        // FIFO stack search results
        stack = [
            {
                term: '',
                data: {}
            }
        ];

    /**
     * Initializes search stack. Search stack is modified after each
     * consecutive search terms entered.
     * @param cache {object} Cache object.
     * @param [fileDescriptors] {string[]} List of file descriptios.
     */
    function stackInit(cache, fileDescriptors) {
        fileDescriptors = fileDescriptors || jOrder.values(cache.node().media);

        // setting up jOrder table
        // required for paging
        var table = jOrder(preprocess(fileDescriptors))
            .index('id', ['mediaid'])
            .index('pager', ['lfile'], {ordered: true, grouped: true, type: jOrder.string});

        // initializing stack
        stack = [
            {
                term: '',
                data: {
                    cache: cache,
                    table: table
                }
            }
        ];
    }

    model.media = {
        //////////////////////////////
        // Getters

        stack: function () {
            return stack;
        },

        //////////////////////////////
        // Control

        /**
         * Initializes media model. Calls service, populates cache.
         * @param handler {function} Handler that's called after initialization completed.
         */
        init: function (handler) {
            // calling service
            services.media.get('', function (json) {
                json = preprocess(json.data);

                var i, row,
                    j, tag,
                    tags, keywords, rating;

                // setting up datastore roots
                cache.set('tag');
                cache.set('media');
                cache.set('keyword');
                cache.set('kind');
                cache.set('name');
                cache.set('rating');
                cache.set('field');

                // loading media data into cache
                for (i = 0; i < json.length; i++) {
                    row = json[i];      // quick reference

                    // backing up original tags & keywords arrays
                    tags = row.tags;
                    keywords = row.keywords;
                    rating = row.rating || '';

                    // resetting tags & keywords array
                    row.tags = {};
                    row.keywords = {};
                    delete row.rating;

                    // storing media node in cache
                    cache.set(['media', row.mediaid], row);

                    // setting properties
                    model.media.setRating(row, rating);
                    model.media.addTags(row, tags);
                    model.media.addKeywords(row, keywords);
                }

                // storing unfiltered data for quick access
                unfiltered = {
                    cache: cache,
                    json: json
                };

                // initializing stack with original cache & orig. flat json
                stackInit(cache, json);

                if (typeof handler === 'function') {
                    handler();
                }
            });
            return model.media;
        },

        /**
         * Resets search stack.
         */
        resetStack: function () {
            if (stack.length > 1) {
                // clearing stack
                stack.splice(0, stack.length - 1);
                return true;
            } else {
                // stack was already empty, nothing happens
                return false;
            }
        },

        /**
         * Filters stack using a given cache path.
         * @param path {string[]} Cache path.
         * @returns {boolean} Success.
         */
        filterStack: function (path) {
            if (!path.length) {
                // re-initializing stack w/ unfiltered data
                stackInit(unfiltered.cache, unfiltered.json);
                return true;
            } else if (path.join('.') === stack[0].path) {
                // filter is same as before
                return false;
            }

            var hits = cache.query(path.concat([null, 'media', '*']), {mode: flock.BOTH});

            // initializing stack with filtered values
            stackInit(flock({
                media: hits
            }));

            return true;
        },

        /**
         * Adds one search term to the filter set.
         * Increments stack.
         * @param expression {string} Search expression. Comma separated.
         * @return {boolean} Success. (Whether the result set changed.)
         */
        search: function (expression) {
            // handling empty search expression
            if (!expression.length) {
                return model.media.resetStack();
            }

            var terms = (',' + expression).split(','), term,
                tstack = jOrder.shallow(stack).reverse(),
                tags, matches, hits,
                i,
                result = false;

            // stack can't be longer than terms
            if (stack.length > terms.length) {
                stack.splice(0, stack.length - terms.length);
                result = true;
            }

            // skipping already processed search terms
            for (i = 1; i < terms.length; i++) {
                if (i >= stack.length) {
                    // stack is shorter than terms, continuing below
                    result = true;
                    break;
                } else if (terms[i] !== tstack[i].term) {
                    // cutting stack at first non-matching term
                    stack.splice(0, stack.length - i);
                    result = true;
                    break;
                }
            }

            // processing terms that differ from what's already on the stack
            for (; i < terms.length; i++) {
                // taking next term
                term = terms[i];

                // acquiring tags matching the entered string
                tags = model.search.matchingWords(term, true);

                // taking _all_ media ids where tags match, then
                matches = cache.query(['tag', tags, 'media', '*'], {mode: flock.KEYS});

                // matching media ids against previous search results
                hits = stack[0].data.cache.query(['media', matches], {mode: flock.BOTH});

                // adding search hits to stack
                stack.unshift({
                    term: term,
                    tags: tags,
                    data: {
                        cache: flock({
                            media: hits
                        }),
                        table: jOrder(jOrder.values(hits))
                            .index('id', ['mediaid'])
                            .index('pager', ['lfile'], {ordered: true, grouped: true, type: jOrder.string})
                    }
                });
            }

            return result;
        },

        /**
         * Retrieves a list of tags matching the filter.
         * @returns {object[]} List of tag entries.
         */
        matchedTags: function () {
            return flock(stack).query('*.tags.*');
        },

        /**
         * Retrieves a list of mediaids matching the current filter.
         * @returns {string[]} List of media identifiers.
         */
        matchedMedia: function () {
            return stack[0].data.cache.query(['media', '*'], {mode: flock.KEYS});
        },

        /**
         * Returns identifiers of all media entries associated with a specific tag.
         * @param tag {string} Tag name.
         * @returns {string[]} List of media identifiers.
         */
        getByTag: function (tag) {
            return cache.query(['tag', tag, 'media', '*'], {mode: flock.KEYS});
        },

        /**
         * Retrieves single media entry matching the submitted identifier.
         * @param mediaid {string} Media identifier.
         * @returns {object} Media entry.
         */
        getById: function (mediaid) {
            return cache.get(['media', mediaid]) || {};
        },

        /**
         * Removes a set of media entries from the cache.
         * @param mediaids {string[]} Identifiers of affected media entries.
         */
        unset: function (mediaids) {
            var media = flock(cache.query(['media', mediaids])),
                i;

            // removing media references from tags
            media.query(['tag', '*', 'media', mediaids], {mode: flock.DEL});

            // removing media entries
            for (i = 0; i < stack.length; i++) {
                stack[i].data.table.remove(media.node(), {indexName: 'id'});
                stack[i].data.cache.query(['media', mediaids], {mode: flock.DEL});
            }
        },

        /**
         * Adds keywords to media entry.
         * @param mediaid {string} Media identifier.
         * @param keywords {string[]} List of keywords in "field:value" format.
         */
        addKeywords: function (mediaid, keywords) {
            var media, i, keyword, ref;

            if (typeof mediaid === 'object') {
                media = mediaid;
                mediaid = media.mediaid;
            } else {
                media = cache.get(['media', mediaid]);
            }

            for (i = 0; i < keywords.length; i++) {
                keyword = keywords[i];
                ref = model.keyword.get(keyword);
                if (!media.keywords.hasOwnProperty(keyword)) {
                    // adding tag reference to media
                    media.keywords[keyword] = ref;

                    // adding media reference to tag
                    ref.media[mediaid] = media;
                    ref.count++;
                }
            }
        },

        /**
         * Adds tags to media entry.
         * @param mediaid {string|object} Media identifier or media entry being affected.
         * @param tags {string[]} List of tags in "name:kind" format.
         */
        addTags: function (mediaid, tags) {
            var media, i, tag, ref;

            if (typeof mediaid === 'object') {
                media = mediaid;
                mediaid = media.mediaid;
            } else {
                media = cache.get(['media', mediaid]);
            }

            for (i = 0; i < tags.length; i++) {
                tag = tags[i];
                ref = model.tag.get(tag);
                if (!media.tags.hasOwnProperty(tag)) {
                    // adding tag reference to media
                    media.tags[tag] = ref;

                    // adding media reference to tag
                    ref.media[mediaid] = media;
                    ref.count++;
                }
            }
        },

        /**
         * Adds single tag to multiple media entries.
         * @param mediaids {string[]} Identifiers of affected media entries.
         * @param tag {string} Tag in "name:kind" format.
         */
        addTag: function (mediaids, tag) {
            var path = ['media', mediaids, 'tags', tag], // path to this tag on all affected entries
                media = cache.query(['media', mediaids]), // media entries affected
                ref = model.tag.get(tag), // reference to tag
                i, mediaid;

            // setting tag references on media
            cache.query(path, {value: ref});

            // adding / updating media references on tag
            for (i = 0; i < mediaids.length; i++) {
                mediaid = mediaids[i];
                if (!ref.media.hasOwnProperty(mediaid)) {
                    ref.media[mediaid] = media[i];
                    ref.count++;
                }
            }
        },

        /**
         * Removes single tag form multiple media entries.
         * @param mediaids {string[]} Identifiers of affected media entries.
         * @param tag {string} Tag in "name:kind" format.
         */
        removeTag: function (mediaids, tag) {
            var path = ['media', mediaids, 'tags', tag], // path to this tag on all affected entries
                tags = cache.query(path), // tags affected by removal
                ref;

            // removing tag from medium if present
            if (tags.length) {
                ref = cache.get(['tag', tag]);

                // removing direct references
                cache.query(['media', mediaids, 'tags', tag], {mode: flock.DEL});
                cache.query(['tag', tag, 'media', mediaids], {mode: flock.DEL});

                // deducting the number of tags actually removed
                ref.count -= tags.length;

                // removing tag altogether
                if (Object.isEmpty(ref.media)) {
                    model.tag.unset(tag);
                }
            }
        },

        /**
         * Sets rating on single media entry.
         * @param row {object} Media entry.
         * @param rating {number} Rating. 1-5.
         */
        setRating: function (row, rating) {
            var mediaid = row.mediaid,
                rate_path = ['media', mediaid, 'rating'],
                current = cache.get(rate_path),
                ref;

            if (rating !== current) {
                // on media node
                cache.set(rate_path, rating);

                // removing entry from old rating on index
                if (typeof current !== 'undefined') {
                    ref = cache.get(['rating', current]);
                    if (typeof ref !== 'undefined') {
                        delete ref.media[mediaid];
                        ref.count--;

                        // removing rating altogether
                        if (ref.count === 0) {
                            cache.unset(['rating', current]);
                        }
                    }
                }

                // adding  entry to new rating on index
                ref = cache.get(['rating', rating]);
                if (typeof ref === 'undefined') {
                    ref = {
                        count: 0,
                        media: {}
                    };
                    cache.set(['rating', rating], ref);
                }
                ref.media[mediaid] = row;
                ref.count++;
            }
        },

        /**
         * Retrieves a page worth of media entries from cache.
         * @param page {number} Page number.
         * @param items {number} Items per page.
         * @returns {object[]} List of media entries.
         */
        // retrieves one page from the table
        getPage: function (page, items) {
            var table = stack[0].data.table;
            return table ?
                table.orderby(['lfile'], jOrder.asc, {offset: page * items, limit: items, renumber: true}) :
                [];
        },

        /**
         * Returns first row of page.
         * @param page {number} Page number.
         * @param items {number} Items per page.
         * @returns {object} Single media entry.
         */
        getFirst: function (page, items) {
            var table = stack[0].data.table;
            return table ?
                table.orderby(['lfile'], jOrder.asc, {offset: page * items, limit: 1, renumber: true}) :
                [
                    {}
                ];
        },

        /**
         * Returns total number of media entry pages in dataset.
         * @param items {number} Items per page.
         * @returns {number} Total number of pages.
         */
        getPages: function (items) {
            var table = stack[0].data.table;
            return table ?
                Math.ceil(table.count() / items) :
                0;
        },

        /**
         * Updates hashes and keywords for media entries.
         * @param diffs {object} Partial media entries, indexed by media identifiers.
         * format: {mediaid: {media entry}}
         * TODO: rename to 'merge'
         */
        update: function (diffs) {
            var mediaid, diff,
                key;

            for (mediaid in diffs) {
                if (diffs.hasOwnProperty(mediaid) &&
                    typeof cache.get(['media', mediaid]) !== 'undefined') {
                    // it is possible that the mediaid being polled is not loaded ATM
                    diff = diffs[mediaid];
                    for (key in diff) {
                        if (diff.hasOwnProperty(key)) {
                            switch (key) {
                            case 'keywords':
                                model.media.addKeywords(mediaid, diff[key]);
                                break;
                            case 'hash':
                                cache.set(['media', mediaid, key], diff[key]);
                                break;
                            }
                        }
                    }
                }
            }
        }
    };

    return model;
}(app.model || {},
    jOrder,
    flock,
    app.cache,
    app.services);

