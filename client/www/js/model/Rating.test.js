/*global flock, app, module, test, ok, equal, deepEqual, raises */
(function ($Rating, $cache) {
    module("Model");

    test("Rating", function () {
        // cleanup
        $cache.unset('media');
        equal(typeof $cache.get('media'), 'undefined', "Input cache cleared");
        $cache.unset('rating');
        equal(typeof $cache.get('rating'), 'undefined', "Lookup cache cleared");

        var entry = {mediaid: '1', rating: '5'};

        // setting media entry with rating
        $cache.set('media.1', entry);
        equal($cache.get('rating.5.count'), 1, "Rating count increased");
        equal($cache.get('rating.5.items.1'), true, "Entry reference added under rating");

        equal($Rating.getCount(5), 1, "Obtaining rating count");
        deepEqual(
            $Rating.getMediaIds(5),
            ['1'],
            "Obtaining media IDs associated with rating"
        );

        // changing rating on existing media entry
        $Rating.setRating('1', 3);
        equal($Rating.getCount(5), 0, "Rating count decreased on before value");
        deepEqual($Rating.getMediaIds(5), [], "Entry reference removed from under before value");
        equal($Rating.getCount(3), 1, "Rating count increased on after value");
        deepEqual(
            $Rating.getMediaIds(3),
            ['1'],
            "Entry reference added to after value"
        );

        // removing media entry
        $cache.unset('media.1');
        equal($Rating.getCount(3), 0, "Rating count decreased after removal");
        deepEqual($Rating.getMediaIds(3), [], "Entry reference removed from under rating");
    });
}(
    app.model.Rating,
    app.cache
));

