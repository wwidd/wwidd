/*global app, module, test, ok, equal, deepEqual, raises */
(function (u_search) {
    module("Model / Search");

    test("Populating", function () {
        var tmp;

        u_search.addTerms("hello", ['foo', 'bar'], {str: "hello"});
        deepEqual(u_search.cache.root, {
            h: {e: {l: {l: {o: {foo: {bar: {hello: {hello: {str: "hello"}}}}}}}}}
        }, "Search string 'hello' added");

        u_search.clear();
        deepEqual(u_search.cache.root, {}, "Search index cleared");

        // index contents after adding "hi all"
        tmp = {
            h: {i: {
                foo: {hi: {'hi all': true}},
                ' ': {a: {l: {l: {
                    foo: {'hi all': {'hi all': true}}
                }}}}
            }},
            a: {l: {l: {
                foo: {all: {'hi all': true}}
            }}}
        };

        u_search.addTerms("hi all", ['foo']);
        deepEqual(u_search.cache.root, tmp, "Term 'hi all' added");

        u_search.removeTerms("hi", ['foo']);
        deepEqual(u_search.cache.root, tmp, "Invalid term attempted to remove");

        // index contents after adding "hi all" and "hit"
        tmp = {
            h: {i: {
                foo: {hi: {'hi all': true}},
                ' ': {a: {l: {l: {
                    foo: {'hi all': {'hi all': true}}
                }}}},
                t: {
                    foo: {hit: {hit: true}}
                }}},
            a: {l: {l: {
                foo: {all: {'hi all': true}}
            }}}
        };

        u_search.addTerms("hit", ['foo']);
        deepEqual(u_search.cache.root, tmp, "Additional term added");

        // index contents after removing "hi all"
        tmp = {
            h: {i: { t: {
                    foo: {hit: {hit: true}}
            }}}
        };

        u_search.removeTerms("hi all", ['foo']);
        deepEqual(u_search.cache.root, tmp, "Original term 'hi all' removed");

        u_search.removeTerms("hit", ['foo']);
        deepEqual(u_search.cache.root, {}, "All terms removed from index");
    });

    test("Retrieval", function () {
        u_search.clear();
        u_search.addTerms(
            [
                "hi all",
                "hello",
                "hit",
                "bye"
            ],
            ['foo']);

        deepEqual(u_search.matchingTerms("hi", ['foo']), ['hi all', 'hit'], "Matched expressions");
        deepEqual(u_search.matchingTerms("hi", ['bar']), [], "Invalid relative path");
        deepEqual(u_search.matchingTerms("he", ['foo']), ['hello'], "Matched expressions");
    });
}(app.model.search));

