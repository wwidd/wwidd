/**
 * Tag Model
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'Tag', function ($model, className, $cache) {
    var base = $model.Model,
        self;

    self = base.extend()
        .addConstant({
            RE_SPLIT_NONTAG: /\s*[^A-Za-z0-9:\s]+\s*/ // non-tag characters with padding
        })
        .addPrivateMethod({
            /**
             * Adds tag entry to cache.
             * @param tag {string} Tag in "name:kind" format.
             * @param entry {object} Tag entry.
             */
            _add: function (tag, entry) {
                // adding node to cache
                $cache.set(['tag', tag], entry);

                // adding node to kinds index
                $model.kind.get(entry.kind)[entry.name] = entry;

                // adding node to basic indexes
                $cache.set(['name', entry.name, entry.kind], entry);

                // adding tag to search index
                $model.Search.addTerms(tag, ['tag'], entry);
            }
        })
        .addMethod({
            /**
             * Splits string along non-tag sections.
             * @param names {string} Comma separated list of tags in "name:kind" format.
             */
            split: function (names) {
                return names.split(self.RE_SPLIT_NONTAG);
            },

            /**
             * Removes non-tag sections (ie. separators) from string.
             * @param names {string} Comma separated list of tags in "name:kind" format.
             */
            sanitize: function (names) {
                return names.split(self.RE_SPLIT_NONTAG).join('');
            },

            /**
             * Retrieves a tag entry (or creates a new one and adds it to the index).
             * @param tag {string} Tag in "name:kind" format.
             * @returns {object} Tag entry.
             */
            get: function (tag) {
                var path_tag = ['tag', tag],
                    ref = $cache.get(path_tag),
                    tmp;

                if (typeof ref === 'undefined') {
                    // creating node
                    tmp = tag.split(':');
                    ref = {
                        tag: tag,
                        name: tmp[0],
                        kind: tmp[1],
                        media: {},
                        count: 0
                    };

                    // adding node to cache
                    self._add(tag, ref);
                }

                return ref;
            },

            /**
             * Changes a tag and updates lookups and indexes accordingly.
             * @param before {string} Current tag value in "name:kind" format.
             * @param after {string} New tag value in "name:kind" format.
             * TODO: index and lookup updates should be done in their respective classes
             * responding to events triggered here.
             */
            set: function (before, after) {
                if (before === after) {
                    return;
                }

                var ref = $cache.get(['tag', before]),
                    tag = flock(ref, flock.COMPAT),
                    tmp = after.split(':');

                // updating basic tag data
                ref.tag = after;
                ref.name = tmp[0];
                ref.kind = tmp[1];

                // removing reference from old tag
                $model.Tag.unset(before);

                // adding reference to new tag
                self._add(after, ref);

                // moving tag reference to new key under affected media entries
                tag.mset(['media', '*', 'tags', after], ref);
            },

            /**
             * Removes tag completely and updates lookups and indexes.
             * @param before {string} Current tag value in "name:kind" format.
             * TODO: index and lookup updates should be done in their respective classes
             * responding to events triggered here.
             */
            unset: function (before) {
                var ref = $cache.get(['tag', before]),
                    tag = flock(ref, flock.COMPAT),
                    tmp = before.split(':');

                // removing references from affected media entries
                tag.munset(['media', '*', 'tags', before], flock.DEL);

                // removing tag from cache
                $cache.unset(['tag', before]);

                // removing references from indexes
                $cache.unset(['name', tmp[0], tmp[1]]);
                $cache.unset(['kind', tmp[1], tmp[0]]);

                // removing references from search index
                $model.Search.removeTerms(before, ['tag']);

                // removing name altogether
                if (Object.isEmpty($cache.get(['name', tmp[0]]))) {
                    $cache.unset(['name', tmp[0]]);
                }
                // removing kind altogether
                if (Object.isEmpty($cache.get(['kind', tmp[1]]))) {
                    $model.kind.unset(tmp[1]);
                }
            }
        });

    return self;
}, app.cache);
