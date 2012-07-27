/*global flock, app, module, test, ok, equal, deepEqual, raises */
(function ($state) {
    module("State");

    test("General", function () {
        deepEqual($state.ROOT, ['state'], "State root");
    });

    test("Library", function () {
        equal(typeof $state.cache.get('state.library'), 'undefined', "No library is set before");

        $state.library('test');
        equal($state.cache.get('state.library'), 'test', "Library is set to 'test'");
        equal($state.library(), 'test', "Library getter");
    });
}(
    app.model.State
));

