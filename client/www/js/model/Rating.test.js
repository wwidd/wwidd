/*global flock, app, module, test, ok, equal, deepEqual, raises */
(function ($Rating, $input, $lookup) {
    module("Model");

    test("Rating", function () {
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

        equal($Rating.getCount(5), 1, "Obtaining rating count");
        deepEqual(
            $Rating.getMedia(5),
            {
                1: entry
            },
            "Obtaining media entries associated with rating"
        );

        // changing rating on existing media entry
        $Rating.setRating('1', 3);
        equal($Rating.getCount(5), 0, "Rating count decreased on before value");
        deepEqual($Rating.getMedia(5), {}, "Entry reference removed from under before value");
        equal($Rating.getCount(3), 1, "Rating count increased on after value");
        deepEqual(
            $Rating.getMedia(3),
            {
                1: entry
            },
            "Entry reference added to after value"
        );

        // removing media entry
        $input.unset('media.1');
        equal($Rating.getCount(3), 0, "Rating count decreased after removal");
        deepEqual($Rating.getMedia(3), {}, "Entry reference removed from under rating");
    });
}(
    app.model.Rating,
    app.input,
    app.lookup
));

