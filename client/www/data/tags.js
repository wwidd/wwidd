////////////////////////////////////////////////////////////////////////////////
// Tags Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, escape */
var app = app || {};

app.data = function (data, jOrder, services) {
	// selects best hit from an array of hits passed
	// every entry in hits must have a numeric column 'count'
	function bestHit(hits) {
		if (hits.length < 1) {
			// no hits
			return null;
		} else if (hits.length < 10) {
			// sufficiently low amount of hits
			// obtaining one with highest count
			// TODO: change to multiple colum sorting as soon as jOrder supports it
			return jOrder(hits)
				.index('count', ['count'], {ordered: true, grouped: true, type: jOrder.number})
				.orderby(['count'], jOrder.desc, {offset: 0, limit: 1})[0];
		} else {
			// obtaining first available hit
			return hits[0];
		}
	}
	
	data.tags = function () {
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function (handler) {
				services.tag.getall(function (json) {
					// preprocessing tag data
					var i, row;
					for (i = 0; i < json.data.length; i++) {
						row = json.data[i];
						row.lname = row.name.toLowerCase();
						row.tag = row.name + '\t' + row.kind;
						row.ltag = row.tag.toLowerCase();
						row.count = parseInt(row.count, 10);
					}
					
					// building table
					self.table = jOrder(json.data)
						.index('tag', ['ltag'], {ordered: true, type: jOrder.string})
						.index('name', ['lname'], {ordered: true, grouped: true, type: jOrder.string})
						.index('kind', ['kind'], {grouped: true, type: jOrder.string});

					// custom callback
					if (handler) {
						handler();
					}
				});
				return self;
			},

			// adds a new tag
			add: function (name, kind) {
				// preparing tags
				var tag = name + '\t' + kind,
						ltag = tag.toLowerCase(),
						row = self.table.where([{ltag: ltag}], {renumber: true})[0];
				
				// adding new tag (lookup key must be escaped)
				if (typeof row === 'undefined') {
					self.table.insert([{
						tag: tag,
						ltag: ltag,
						name: name,
						lname: name.toLowerCase(),
						kind: kind,
						count: 1
					}]);
				} else {
					row.count++;
				}
				
				return self;
			},
			
			// removes an existing tag
			remove: function (name, kind) {
				// preparing lookup key
				var tag = name + '\t' + kind,
						ltag = tag.toLowerCase(),
						row = self.table.where([{ltag: ltag}], {renumber: true})[0];
				
				// removing tag
				// NOTE: because the 'tags' service returns only one tag per kind,
				// certain tags may not be on index and can return undefined on search
				if (typeof row !== 'undefined') {
					if (row.count === 1) {
						self.table.remove([row]);
					} else {
						// count is not indexed, no need for .update()
						row.count--;
					}
				}
				
				return self;
			},
			
			// retrieves the first matching tag to a search term
			searchTag: function (term) {
				var hits = self.table.where([{ltag: term.replace(':', '\t')}], {mode: jOrder.startof, renumber: true}),
						hit = bestHit(hits) || {tag: ""};
				return hit.tag.replace('\t', ':');
			},
			
			// retrieves the first matching name (kind is ignored)
			searchName: function (term) {
				var hits = self.table.where([{lname: term}], {mode: jOrder.startof, renumber: true}),
						hit = bestHit(hits) || {name: ""};
				return hit.name;
			}
		};

		return self;
	}();
	
	return data;
}(app.data,
	jOrder,
	app.services);

