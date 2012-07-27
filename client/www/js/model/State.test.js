/*global flock, app, module, test, ok, equal, deepEqual, raises */
(function ($state, $cache) {
    module("State");

    test("General", function () {
        deepEqual($state.ROOT, ['state'], "State root");
    });

    test("Library", function () {
        equal(typeof $cache.get($state.ROOT.concat('library'), true), 'undefined', "No library is set before");

        $state.library('test');
        equal($cache.get($state.ROOT.concat('library'), true), 'test', "Library is set to 'test'");
        equal($state.library(), 'test', "Library getter");
    });
}(
    app.model.State,
    app.input
));

