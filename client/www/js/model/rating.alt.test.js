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

        // changing rating on existing media entry
        $rating.setRating('1', 3);
        equal($rating.getCount(5), 0, "Rating count decreased on before value");
        deepEqual($rating.getMedia(5), {}, "Entry reference removed from under before value");
        equal($rating.getCount(3), 1, "Rating count increased on after value");
        deepEqual(
            $rating.getMedia(3),
            {
                1: entry
            },
            "Entry reference added to after value"
        );

        // removing media entry
        $input.unset('media.1');
        equal($rating.getCount(3), 0, "Rating count decreased after removal");
        deepEqual($rating.getMedia(3), {}, "Entry reference removed from under rating");
    });
}(
    app.model.ratingAlt,
    app.input,
    app.lookup
));

