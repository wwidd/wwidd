/*global app, module, test, ok, equal, deepEqual, raises */
(function (Search) {
    module("Search");

    test("Populating", function () {
        var tmp;

        Search.addTerms("hello", ['foo', 'bar'], {str: "hello"});
        deepEqual(Search.cache.root, {
            h: {e: {l: {l: {o: {foo: {bar: {hello: {hello: {str: "hello"}}}}}}}}}
        }, "Search string 'hello' added");

        Search.clear();
        deepEqual(Search.cache.root, {}, "Search index cleared");

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

        Search.addTerms("hi all", ['foo']);
        deepEqual(Search.cache.root, tmp, "Term 'hi all' added");

        Search.removeTerms("hi", ['foo']);
        deepEqual(Search.cache.root, tmp, "Invalid term attempted to remove");

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

        Search.addTerms("hit", ['foo']);
        deepEqual(Search.cache.root, tmp, "Additional term added");

        // index contents after removing "hi all"
        tmp = {
            h: {i: { t: {
                    foo: {hit: {hit: true}}
            }}}
        };

        Search.removeTerms("hi all", ['foo']);
        deepEqual(Search.cache.root, tmp, "Original term 'hi all' removed");

        Search.removeTerms("hit", ['foo']);
        deepEqual(Search.cache.root, {}, "All terms removed from index");
    });

    test("Retrieval", function () {
        Search.clear();
        Search.addTerms(
            [
                "hi all",
                "hello",
                "hit",
                "bye"
            ],
            ['foo']);

        deepEqual(Search.matchingTerms("hi", ['foo']), ['hi all', 'hit'], "Matched expressions");
        deepEqual(Search.matchingTerms("hi", ['bar']), [], "Invalid relative path");
        deepEqual(Search.matchingTerms("he", ['foo']), ['hello'], "Matched expressions");
    });
}(app.model.Search));

