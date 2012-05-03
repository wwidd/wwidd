/*global flock, app, module, test, ok, equal, deepEqual, raises */
(function ($rating, $input, $lookup) {
    module("Model");

    test("Alt Rating", function () {
        equal(app.lookup.noevent, true, "Lookup is not evented");

        // cleanup
        $input.unset('media');
        equal(typeof $input.get('media', true), 'undefined', "Input cache cleared");
        $lookup.unset('rating');
        equal(typeof $lookup.get('rating', true), 'undefined', "Lookup cache cleared");

        var entry = {mediaid: '1', rating: '5'};

        // setting media entry with rating
        $input.set('media.1', entry);
        equal($lookup.get('rating.5.count', true), 1, "Rating count increased");
        equal($lookup.get('rating.5.items.1', true), entry, "Entry reference added under rating");

        equal($rating.getCount(5), 1, "Obtaining rating count");
        deepEqual(
            $rating.getMedia(5),
            {
                1: entry
            },
            "Obtaining media entries associated with rating"
        );
    });
}(
    app.model.ratingAlt,
    app.input,
    app.lookup
));

