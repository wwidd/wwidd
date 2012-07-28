/**
 * Media Rater Widget
 *
 * Rates media fro 1 star to 5 stars.
 */
/*global jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith, model, services) {
    widgets.rater = function (mediaid) {
        var self = wraith.widget.create();

        //////////////////////////////
        // Event handlers

        function onMouseOver() {
            var buttons = $('#' + self.id).find('a');

            // filling as many stars as the user points at
            buttons
                .removeClass('star')
                .eq(buttons.index(this))
                .prevAll()
                .andSelf()
                .addClass('star');
        }

        function onClick() {
            var rating = $('#' + self.id).find('a').index(this) + 1;
            // calling rater service
            services.media.rate(mediaid, rating, function () {
                model.Media.setRating(model.Media.getById(mediaid), rating);
                self.render();
                widgets.discovery.refreshRatings();
            });
            return false;
        }

        //////////////////////////////
        // Overrides

        self.init = function (elem) {
            elem
                .mouseleave(function () {
                self.render();
            })
                .find('a')
                .mouseover(onMouseOver)
                .click(onClick);
        };

        self.html = function () {
            var row = model.Media.getById(mediaid);
            return widgets.rater.html(row.rating, self.id);
        };

        return self;
    };

    // static view generator
    widgets.rater.html = function (rating, id) {
        var result = ['<div ', id ? 'id="' + id + '" ' : '', 'class="w_rater">'],
            i;

        for (i = 0; i < rating || 0; i++) {
            result.push('<a href="#" class="star"></a>');
        }
        for (; i < 5; i++) {
            result.push('<a href="#"></a>');
        }
        result.push('</div>');

        return result.join('');
    };

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    app.model,
    app.services);

