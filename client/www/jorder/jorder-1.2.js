////////////////////////////////////////////////////////////////////////////////
// jOrder, index-based data manipulation library
// Copyright (c) 2010-2011 Dan Stocker, http://jorder.net
////////////////////////////////////////////////////////////////////////////////

var jOrder = function (json, options) {
	return jOrder.table(json, options);
};

jOrder.core = function () {
	var self = {
		MAX_DEPTH: 10,
		
		// delegates all of a module's properties to the jOrder object
		delegate: function (module, host, properties) {
			host = host || jOrder;
			var property;
			for (property in module) {
				if (
					// strict condition when no explicite property list given
					!properties && module.hasOwnProperty(property) ||
					// loose condition when explicite property list is present
					properties.hasOwnProperty(property) && (property in module)
				) {
					host[property] = module[property];
				}
			}
			return module;
		},
	
		// creates a deep copy of the object recursively
		// optionally renumbered
		deep: function (json, renumber, depth) {
			depth = depth || 0;
			
			// checking depth
			if (depth >= self.MAX_DEPTH) {
				throw "Deep copying exceeded maximum depth (" + self.MAX_DEPTH + ")";
			}
			
			var result,
					isArray = json && typeof json.length !== 'undefined',
					i;
			
			// renumber flag only valid if json is array
			renumber = isArray && renumber === true;
			
			// ordinal types are returned as is
			if (typeof json !== 'object' || json === null) {
				return json;
			}
			
			// processing arrays and hashtables
			result = isArray ? [] : {};
			for (i in json) {
				if (json.hasOwnProperty(i)) {
					if (renumber) {
						result.push(self.deep(json[i], renumber, depth + 1));
					} else {
						result[i] = self.deep(json[i], renumber, depth + 1);
					}
				}
			}
			return result;
		},
		
		// makes a shallow copy of the passed JSON
		// optionally renumbered
		shallow: function (json, renumber) {
			var result,
					i;
			if (renumber) {
				// new indices starting from 0
				result = [];
				for (i in json) {
					if (!isNaN(i)) {
						result.push(json[i]);
					}
				}
			} else {
				result = json.concat([]);
			}
			return result;
		},

		// retrieves the keys of an object
		// returns an array of STRINGS
		// as object property keys are always strings
		keys: function (object) {
			var result = [],
					key;
			for (key in object) {
				if (object.hasOwnProperty(key)) {
					result.push(key);
				}
			}
			return result;
		},
	
		// gathers the values of an object
		values: function (object) {
			var result = [],
					key;
			for (key in object) {
				if (object.hasOwnProperty(key)) {
					result.push(object[key]);
				}
			}
			return result;
		},
		
		// splits an object to keys and values
		split: function (object) {
			var keys = [],
					values = [],
					key;
			for (key in object) {
				if (object.hasOwnProperty(key)) {
					keys.push(key);
					values.push(object[key]);
				}
			}
			return {
				keys: keys,
				values: values
			};
		},
		
		// joins two objects by their shared keys
		join: function (left, right) {
			var result = {},
					key;
			for (key in left) {
				if (left.hasOwnProperty(key)) {
					result[left[key]] = right[key];
				}
			}
			return result;
		},
		
		// legacy function for deep copying
		// DEPRECATED
		copyTable: function (json) {
			return self.deep(json, true);
		}
	};

	return self.delegate(self);
}();

////////////////////////////////////////////////////////////////////////////////
// Object.create
////////////////////////////////////////////////////////////////////////////////
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		function F() {}
		F.prototype = o;
		return new F();
	}
}

////////////////////////////////////////////////////////////////////////////////
// jOrder constants
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.constants = function ($core) {
	return $core.delegate({
		// version
		name: "jOrder",
		
		// sorting directions
		asc: 1,
		desc: -1,
		
		// index types
		string: 0,
		number: 1,
		text: 2,
		array: 3,
		
		// range params
		start: 0,
		end: 1,
		
		// search modes
		exact: 0,
		range: 1,
		startof: 2
	});
}(jOrder.core);

////////////////////////////////////////////////////////////////////////////////
// Logging
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, window, console */

jOrder.logging = function ($core) {
	var lconsole = typeof window === 'object' ? window.console : console,
	
	// properties
	self = {
		// logs to console
		log: function (msg) {
			if (lconsole && jOrder.logging) {
				lconsole.log(msg);
			}
		},
		// issues a warning
		warn: function (msg) {
			if (lconsole && jOrder.logging) {
				lconsole.warn(msg);
			}
		},
		// use throw instead of console.error()
		// DEPRECATED
		error: function () {
			self.warn("Use throw instead of .error()");
		}
	};
	
	// legacy warning function
	// DEPRECATED
	self.warning = self.warn;
	
	return $core.delegate(self);
}(jOrder.core);

////////////////////////////////////////////////////////////////////////////////
// Collection
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.collection = function ($logging) {
	return function () {
		var items = {},
				count = 0,
		
		self = {
			// adds an item to the collection
			// - name: identifies item
			// - item: to be added
			add: function (name, item) {
				// adding item to collection (and optionally removing previous)
				if (items.hasOwnProperty(name)) {
					$logging.warn("Overwriting existing item '" + name + "'");
					delete items[name];
					count--;
				}
				items[name] = item;
				count++;
				return this;
			},
			
			// returns an item from teh collection
			// - name: identifies the item to return
			get: function (name) {
				if (!items.hasOwnProperty(name)) {
					$logging.warn("Invalid item name: '" + name + "'");
					return;
				}
				return items[name];
			},
			
			// clears collection
			clear: function () {
				items = {};
				count = 0;
				return this;
			},
			
			// calls a handler on each item
			// - handler: to be called on each item
			each: function (handler) {
				var i;
				for (i in items) {
					// calling handler and terminating if return value is true
					if (items.hasOwnProperty(i) && handler(i, items[i]) === true) {
						return this;
					}
				}
				return this;
			},
			
			// returns the number of items in the collection
			count: function () {
				return count;
			}
		};
		
		return self;
	};
}(jOrder.logging);

////////////////////////////////////////////////////////////////////////////////
// jOrder index signature
// Base class for index objects: lookup and order
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, escape */

jOrder.signature = function ($constants, $core, $logging) {
	// - fields: array of strings representing table fields
	// - options: grouped, sorted, data type
	//	 - type: jOrder.string, jOrder.number, jOrder.text, jOrder.array
	return function (fields, options) {
		// check presence
		if (typeof fields === 'undefined' || !fields.length) {
			throw "No field(s) specified";
		}

		// default options		
		options = options || {};
	
		// check consistency
		if (fields.length > 1) {
			switch (options.type) {
			case $constants.text:
				throw "Can't create a text index on more than one field.";
			case $constants.number:
				throw "Can't create a number index on more than one field.";
			}
		}

		var self = {
			options: options,

			// generates or validates a signature based on index
			// - row: row to be validated against index
			// - strict: specifies checking direction (row -> index or index -> row)
			signature: function (row, strict) {
				// returning signature
				if (!row) {
					return escape(fields.join('_'));
				}
				// validating row
				var i, lookup;
				if (strict) {
					// all fields of the roe must be present in the index
					lookup = $core.join(fields, []);
					for (i in row) {
						if (row.hasOwnProperty(i) && !lookup.hasOwnProperty(i)) {
							return false;
						}
					}
				} else {
					// all fields of the index must be present in the row
					for (i = 0; i < fields.length; i++) {
						if (!row.hasOwnProperty(fields[i])) {
							// fail early
							return false;
						}
					}
				}
				return true;
			},
				
			// extracts key associated with a row according to index definition
			// for lookup purposes
			// - row: data row to extract keys from
			key: function (row) {
				// extracting numeric key
				if (self.options.type === $constants.number) {
					return row[fields[0]];
				}
				// extracting one (composite) key from any other type
				var key = [],
						i, field;
				for (i = 0; i < fields.length; i++) {
					field = fields[i];
					if (!row.hasOwnProperty(field)) {
						return undefined;
					}
					key.push(row[field]);
				}
				return escape(key.join('_'));
			},

			// extracts one or more key values associated with a row
			// according to index definition
			// - row: data row to extract keys from
			keys: function (row) {
				switch (self.options.type) {
				case $constants.array:
					// returning first field as is (already array)
					return row[fields[0]];
				case $constants.text:
					// extracting multiple keys by splitting along spaces
					return row[fields[0]].split(/\s+/g);
				default:
				case $constants.number:
				case $constants.string:
					// extracting one (composite) key from any other type
					var key = self.key(row);
					return typeof key !== 'undefined' ? [key] : [];
				}
			}
		};

		return self;
	};
}(jOrder.constants,
	jOrder.core,
	jOrder.logging);

////////////////////////////////////////////////////////////////////////////////
// jOrder lookup index
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.lookup = function ($constants, $logging, $signature) {
	// generates a lookup index on the specified table for the given set of fields
	// - json: array of uniform objects
	// - fields: array of strings representing table fields
	// - options: grouped, sorted, data type
	//	 - grouped: bool
	//	 - type: jOrder.string, jOrder.number, jOrder.text, jOrder.array
	return function (json, fields, options) {
		// private values
		var base = $signature(fields, options),
				self = Object.create(base),
				flat, count;

		// clears internal buffers
		self.clear = function () {
			flat = {};
			count = 0;
		};
		self.clear();
		
		// sets a lookup value for a given data row
		// - keys: keys to add to index, extracted from row
		// - rowId: index of the row in the original (flat) table
		self.add = function (keys, rowId) {
			// adding index value for each key in row
			var i, key, ids;
			for (i = 0; i < keys.length; i++) {
				key = keys[i];
				// adding row id to index
				if (self.options.grouped) {
					// grouped index
					if (!flat.hasOwnProperty(key)) {
						// initializing index key
						ids = { items: {}, count: 1 };
						ids.items[rowId] = rowId;
						flat[key] = ids;
						count++;
					} else {
						// incrementing index key
						ids = flat[key];
						if (!ids.items.hasOwnProperty(rowId)) {
							ids.count++;
							ids.items[rowId] = rowId;
							count++;
						}
					}
				} else {
					// non-grouped index
					if (flat.hasOwnProperty(key)) {
						throw "Can't add more than one row ID to the non-grouped index '" + self.signature() + "'. Consider using a group index instead.";
					}
					flat[key] = rowId;
					count++;
				}
			}
		};

		// removes a key from the index
		// - keys: keys to delete from index
		// - rowId: id of row to delete
		self.remove = function (keys, rowId) {
			var i, key, ids;
			for (i = 0; i < keys.length; i++) {
				key = keys[i];

				if (!flat.hasOwnProperty(key)) {
					throw "Can't remove row. Row '" + key + "' doesn't match signature '" + self.signature() + "'.";
				}

				// removing key from unique index altogether
				if (!self.options.grouped) {
					delete flat[key];
					count--;
					return;
				}

				if (typeof rowId === 'undefined') {
					throw "Must pass rowId when deleting from group index.";
				}
				
				// decreasing count on selected key
				ids = flat[key];
				if (ids.items && ids.items.hasOwnProperty(rowId)) {
					ids.count--;
					count--;
				}
				if (!ids.count) {
					// deleting key altogether
					// when there are no more items in key
					delete flat[key];
				} else {
					// removing item associated with row
					delete ids.items[rowId];
				}
			}
		};

		// returns original rowids for rows according to index
		// - rows: sparse array of data rows to look up
		self.lookup = function (rows) {
			var result = [],
					i, key, ids,	// 'ids' is a sparse array, since 'rows' is
					j;
			for (i in rows) {
				if (flat.hasOwnProperty(key = self.key(rows[i]))) {
					// taking associated row ids from internal index structure
					ids = flat[key].items;
					if (ids) {
						// for grouped index
						for (j in ids) {
							if (ids.hasOwnProperty(j)) {
								result.push(ids[j]);
							}
						}
					} else {
						// for unique index
						result.push(flat[key]);
					}
				}
			}
			return result;
		};
	
		// flat, json representation of the index data
		self.flat = function () {
			return flat;
		};
		
		// returns key count for one key or whole index
		// - key: key to count
		self.count = function (key) {
			if (typeof key === 'undefined') {
				// total count on no key specified
				return count;
			} else if (!flat.hasOwnProperty(key)) {
				// key is not present in lookup
				return 0;
			} else if (self.options.grouped) {
				// key count on grouped index
				return flat[key].count;
			} else {
				// unique index has only 1 of each key
				return 1;
			}
		};
	
		return self;
	};
}(jOrder.constants,
	jOrder.logging,
	jOrder.signature);

////////////////////////////////////////////////////////////////////////////////
// B-search based order lookup for jOrder
//
// Terminology:
// - Tight Array: Array with no gaps
// - Dense Array: Array with a few, small gaps
// - Sparse Array: Array with gaps overweighing data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, escape */

jOrder.order = function ($constants, $logging, $signature) {
	// constants
	var DEFAULT_LIMIT = 100;
	
	// generates a lookup order on the specified table for the given set of fields
	// - json: array of uniform objects
	// - fields: array of strings representing table fields
	// - options: grouped, sorted, data type
	//	 - type: jOrder.string, jOrder.number, jOrder.text, jOrder.array
	return function (json, fields, options) {
		// private values
		var base = $signature(fields, options),
				self = Object.create(base),
				order;
		
		// clears internal buffers
		self.clear = function () {
			order = [];
		};
		self.clear();
				
		// reorders the index
		// must use comparer, since order contains objects, not strings
		// sort() w/o comparer is a lot faster in certain browsers tho
		self.reorder = function () {
			order.sort(function (a, b) {
				if (a.key > b.key) {
					return 1;
				} else if (a.key < b.key) {
					return -1;
				} else if (a.rowId > b.rowId) {
					return 1;
				} else if (a.rowId < b.rowId) {
					return -1;
				} else {
					return 0;
				}
			});
		};

		// tests an actual key value against expected
		function equal(actual, expected) {
			switch (self.options.type) {
			case $constants.string:
			case $constants.text:
				return actual.match(new RegExp('^' + expected));
			default:
			case $constants.number:
				return actual === expected;
			}
		}
		
		// sets a lookup value for a given data row
		// - keys: keys to add to index, extracted from row
		// - rowId: index of the row in the original (flat) table
		// - reorder: whether to re-calcuate order after addition
		self.add = function (keys, rowId, lazy) {
			// adding index value for each key in row
			var i, key, pos, alt;
			for (i = 0; i < keys.length; i++) {
				// determining what key to store depending on index type
				key = keys[i];
				switch (self.options.type) {
				case $constants.text:
				case $constants.array:
					alt = key.toLowerCase();
					break;
				default:
					alt = key;
					break;
				}
				// adding key to index
				if (lazy) {
					// adding key to order at end
					// index must be sorted before use
					order.push({ key: alt, rowId: rowId });
				} else {
					// adding key to order at suitable index
					// number variable type must be preserved for sorting purposes
					pos = order.length > 0 ? self.bsearch(key, $constants.start, rowId) : 0;
					order.splice(pos, 0, { key: alt, rowId: rowId });
				}
			}
		};

		// removes rows from order preserving index integrity
		// slow for repetitious indexes, use only when necessary
		// - keys: keys identifying the rows to remove
		// - rowId: index of row to be removed
		self.remove = function (keys, rowId) {
			var i, pos;
			for (i = 0; i < keys.length; i++) {
				// finding a matching id in log(n) steps
				pos = self.bsearch(keys[i], $constants.start, rowId);
				// removing key from order
				order.splice(pos, 1);
			}
		};
		
		// internal function for bsearch
		// - key: search term key
		// - start: starting index in the order
		// - end: ending index in the order
		function bsearch(key, start, end, rowId) {
			var hasId = typeof rowId !== 'undefined',
					middle, median,
					first = order[start];
			
			// returning first item on exact hit
			if (hasId && first.rowId === rowId ||
				!hasId && equal(first.key, key)) {
				return {pos: start, exact: true};
			}

			// returning hit if scope shrunk to 1 item
			// (usual exit-point)
			if (end - start <= 1) {
				return {pos: start, exact: false};
			}
			// pin-pointing middle item and deciding which half to take
			// of two items, it'll take the smaller
			middle = start + Math.floor((end - start) / 2);
			median = order[middle];
			if (median.key < key ||
					hasId && median.key === key && median.rowId < rowId) {
				return bsearch(key, middle, end, rowId);
			} else {
				return bsearch(key, start, middle, rowId);
			}
		}
		
		// binary search on ordered list
		// returns the position or preceeding position of the searched value
		// order is expected to be a tight array
		// - value: value we're lookung for
		// - type: $constants.start or $constants.end
		// - rowId: UNDOCUMENTED. required by .add()
		self.bsearch = function (key, type, rowId) {
			// returning "not found" when order is empty
			if (!order.length) {
				return -1;
			}
			
			// default range equals full length
			var start = 0,
					first = order[0],
					end = order.length - 1,
					last = order[end],
					hasId = typeof rowId !== 'undefined',
					hit, pos;

			// determining whether key is off-index
			if (key < first.key || hasId && equal(first.key, key) && rowId < first.rowId) {
				// returning first index if key is start type
				// -1 otherwise
				return type === $constants.start ? start : - 1;
			} else if (key > last.key || hasId && equal(last.key, key) && rowId > last.rowId) {
				// returning last index if key is end type
				// last+1 otherwise
				return type === $constants.end ? end : order.length;
			}
			
			// start search
			// returned index doesn't have to be valid
			// if the key & type combination spot an off-index position
			hit = bsearch(key, start, end, rowId);			
			if (hit.exact) {
				// exact hit returns the pos as start position
				pos = type === $constants.start ? hit.pos : hit.pos - 1;
			} else {
				// non-exact hit returns the pos preceding a possible match
				pos = type === $constants.start ? hit.pos + 1 : hit.pos;
			}
			return pos;
		};

		// returns a list of rowIds matching the given bounds
		// - bounds:
		//	 - lower: lower bound for the range
		//	 - upper: upper bound of the range
		// - options:
		//	 - offset
		//	 - limit
		self.range = function (bounds, options) {
			// default bounds
			bounds = bounds || {};
			
			// default options
			options = options || {};
			options.offset = options.offset || 0;
			options.limit = options.limit || DEFAULT_LIMIT;

			var lower, upper,
					start, end,
					result = [],
					i;
			
			// determining search bounds based on index type and arguments
			switch (self.options.type) {
			case $constants.text:
				lower = bounds.lower ? escape(bounds.lower.toLowerCase()) : bounds.lower;
				upper = bounds.upper ? escape(bounds.upper.toLowerCase()) : bounds.upper;
				break;
			case $constants.string:
				lower = bounds.lower ? escape(bounds.lower) : bounds.lower;
				upper = bounds.upper ? escape(bounds.upper) : bounds.upper;
				break;
			default:
				lower = bounds.lower;
				upper = bounds.upper;
				break;
			}
			
			// obtaining start of range
			start = (typeof lower !== 'undefined' ? self.bsearch(lower, $constants.start) : 0) + options.offset;

			// obtaining end of range
			// smallest of [range end, page end (limit), table length]
			end = Math.min(
				typeof upper !== 'undefined' ? self.bsearch(upper, $constants.end) : order.length - 1,
				start + options.limit - 1);

			// collecting positions of actial data rows according to index
			for (i = start; i <= end; i++) {
				result.push(order[i].rowId);
			}
			return result;
		};

		// returns a copy of the index order
		// without options, returns reference to order object -> faster
		// - dir: either jOrder.asc or jOrder.desc
		// - options
		//	 - offset
		//	 - limit
		self.order = function (dir, options) {
			// returning early on empty index
			if (!order.length) {
				return order;
			}

			// default args
			dir = dir || $constants.asc;
			options = options || {};
			options.offset = options.offset || 0;
			options.limit = options.limit || 0;
			
			// returning ref for ascending, full order
			if (dir === $constants.asc && !options.offset && !options.limit) {
				return order;
			}

			// taking slice of order
			options.limit = options.limit || DEFAULT_LIMIT;
			switch (dir) {
			case $constants.desc:
				return order.slice(Math.max(0, order.length - options.offset - options.limit), order.length - options.offset).reverse();
			default:
			case $constants.asc:
				return order.slice(options.offset, Math.min(options.offset + options.limit, order.length));
			}
		};

		// legacy methods 
		self.compact = function () {
			$logging.warn("Compacting is obsolete");
		};
		
		return self;
	};
}(jOrder.constants,
	jOrder.logging,
	jOrder.signature);

////////////////////////////////////////////////////////////////////////////////
// jOrder index object
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.index = function ($core, $constants, $logging, $lookup, $order) {
	// generates a lookup index on the specified table for the given set of fields
	// - json: array of uniform objects
	// - fields: array of strings representing table fields
	// - options: grouped, sorted, data type
	//	 - grouped: bool
	//	 - ordered: bool
	//	 - type: jOrder.string, jOrder.number, jOrder.text, jOrder.array
	//	 - build: bool
	return function (json, fields, options) {
		// default options
		options = options || {};
		options.type = options.type || $constants.string;
		
		// private values
		var lookup = $lookup(json, fields, options),
				order = options.ordered ? $order(json, fields, options) : null,
				
		self = {
			// sets a lookup value for a given data row
			// - row: data row that serves as basis for the index key
			// - rowId: index of the row in the original (flat) table
			// - lazy: lazy sorting - only consistent on all items added
			add: function (row, rowId, lazy) {
				// obtaining keys associated with the row
				var keys = self.keys(row);
				if (!keys.length) {
					throw "Can't add row to index. No field matches signature '" + self.signature() + "'";
				}

				// adding entry to lookup index
				lookup.add(keys, rowId);
				
				// adding entry to order
				if (order) {
					order.add(keys, rowId, lazy);
				}
				
				return self;
			},
	
			// removes a key from the index
			// - row: row to delete
			// - rowId: id of row to delete
			remove: function (row, rowId) {
				// obtaining keys associated with the row
				var keys = self.keys(row);
				if (!keys.length) {
					throw "Can't remove row from index. No field matches signature '" + self.signature() + "'";
				}

				// removing entry from lookup ondex
				lookup.remove(keys, rowId);
				
				// removing entry from order
				if (order) {
					order.remove(keys, rowId);
				}
				
				return self;
			},
	
			// clears index
			unbuild: function () {
				lookup.clear();
				if (order) {
					order.clear();
				}
				
				return self;
			},
			
			// rebuilds index based on original json and options
			// - lazy: lazy sorting - only consistent on all items added
			rebuild: function (lazy) {
				// clearing index
				self.unbuild();
				
				// generating index
				$logging.log("Building index of length: " + json.length + ", signature '" + lookup.signature() + "'.");
				var i, row;
				for (i = 0; i < json.length; i++) {
					// skipping 'holes' in array
					if (!(row = json[i])) {
						continue;
					}
					self.add(row, i, lazy);
				}
				
				if (order && lazy) {
					order.reorder();
				}
				
				return self;
			},
	
			// tells whether the index id grouped
			grouped: function () {
				return Boolean(options.grouped);
			},
	
			// tells whether the index is ordered
			ordered: function () {
				return Boolean(order);
			},
	
			// returns index type
			type: function () {
				return options.type;
			}
		};
	
		// delegating methods from lookup and order
		// NOTE: delegated methods MUST NOT return reference to self!
		$core.delegate(lookup, self, {
			'lookup': true,
			'flat': true,
			'count': true,
			'signature': true,
			'key': true,
			'keys': true
		});
		if (order) {
			$core.delegate(order, self, {
				'reorder': true,
				'compact': true,
				'bsearch': true,
				'range': true,
				'order': true
			});
		}
		
		// building index (w/ opting out)
		if (options.build !== false) {
			self.rebuild(true);
		}
		
		return self;
	};
}(jOrder.core,
	jOrder.constants,
	jOrder.logging,
	jOrder.lookup,
	jOrder.order);

////////////////////////////////////////////////////////////////////////////////
// jOrder index collection for tables
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.indexes = function ($collection, $index) {
	// index collection
	// - json: json table the table object is based on
	return function (json) {
		// member variables
		var self = Object.create($collection()),
				base_add = self.add,
				indexes = {},
				count = 0;
		
		// adds an index to the collection
		self.add = function (name, fields, options) {
			// calling add() of base
			base_add(name, $index(json, fields, options));
		};

		// looks up an index according to the given fields
		// - indexName: name of index to look up
		// - options:
		//   - row: sample row that's supposed to match the index
		//   - grouped: whether the index in question should be
		self.find = function (indexName, options) {
			options = options || {};
			
			// looking up by index
			if (indexName) {
				return self.get(indexName);
			}
			
			var index;
			self.each(function (key, item) {
				if ((typeof options.row === 'undefined' || item.signature(options.row, true)) &&
					(typeof options.grouped === 'undefined' || item.grouped() === options.grouped)) {
					index = item;
					return true;
				}
			});
			return index;
		};
	
		// rebuilds all indexes on table
		self.rebuild = function () {
			self.each(function (name, index) {
				index.rebuild();
			});
		};

		// tells whether there's an ordered index on the given combination of fields
		self.ordered = function (fields) {
			var index = self.find(null, {row: fields});
			if (!index) {
				return false;
			}
			return index.ordered();
		};

		// tells whether there's an ordered index on the given combination of fields
		self.grouped = function (fields) {
			var index = self.find(null, {row: fields});
			if (!index) {
				return false;
			}
			return index.grouped();
		};
		
		return self;
	};
}(jOrder.collection,
	jOrder.index);

////////////////////////////////////////////////////////////////////////////////
// jOrder index object
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.selectors = function ($core) {
	// selectors used in table.filter()
	return {
		// selects exact matches
		// handles multiple conditions
		exact: function (row, data) {
			var match = false,
					partial, condition,
					i, field;
			for (i = 0; i < data.conditions.length; i++) {
				partial = true;
				condition = data.conditions[i];
				for (field in condition) {
					if (condition.hasOwnProperty(field)) {
						partial &= (condition[field] === row[field]);
						if (!partial) {
							break;
						}
					}
				}
				match |= partial;
				if (match) {
					break;
				}
			}
			return match;
		},
		
		// selectes start of word matches
		// only first condition is processed
		startof: function (row, data) {
			var kv = $core.split(data.conditions[0]);
			return row[kv.keys[0]].indexOf(kv.values[0]) === 0;
		},
		
		// selects range of values
		// only first condition is processed
		range: function (row, data) {
			var kv = $core.split(data.conditions[0]),
					bounds = kv.values[0],
					field = kv.keys[0];
			return bounds.lower <= row[field] && bounds.upper > row[field];
		}
	};
}(jOrder.core);

////////////////////////////////////////////////////////////////////////////////
// jOrder index object
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */

jOrder.table = function ($core, $constants, $logging, $indexes, $selectors) {
	// indexed table object
	// - data: json table the table object is based on
	// - options:
	return function (json, options) {
		options = options || { renumber: false };

		// member variables
		var indexes = $indexes(json),
		
		self = {
			index: function (name, fields, options) {
				if (!name) {
					// reindexing table on no args at all 
					indexes.rebuild();
					return self;
				} else if (!fields) {
					// looking up index when only name arg is given
					return indexes.get(name);
				} else {
					indexes.add(name, fields, options);
					return self;
				}
			},
			
			// rebuilds all indexes on table
			reindex: function () {
				indexes.rebuild();
				return self;
			},
			
			clear: function () {
				indexes.clear();
				return self;
			},
	
			// updates, inserts or deletes one row in the table, modifies indexes
			// - before: data row
			// - after: changed data row
			// - options: [indexName]
			update: function (before, after, options) {
				options = options || {};
	
				var index = indexes.find(options.indexName, {grouped: false}),
						i,
						oldId, newId,
						name;
	
				// obtaining old row
				if (before) {
					if (!index) {
						throw "Can't find suitable index for fields: '" + $core.keys(before).join(",") + "'.";
					}
					oldId = index.lookup([before])[0];
					before = json[oldId];
				}
	
				// updating json
				if (typeof oldId === 'undefined') {
					// inserting new
					if (!after) {
						$logging.warn("Update called but nothing changed.");
						return self;
					}
					newId = json.push(after) - 1;
				} else {
					// deleting old
					delete json[oldId];
					// inserting new
					if (after) {
						newId = json.push(after) - 1;
					}
				}
	
				// updating indexes
				indexes.each(function (name, index) {
					if (before) {
						index.remove(before, oldId);
					}
					if (after) {
						index.add(after, newId);
					}
				});
				return self;
			},
	
			// inserts a row into the table, updates indexes
			// - rows: table rows to be inserted
			// - options: [indexName]
			insert: function (rows, options) {
				var i;
				for (i = 0; i < rows.length; i++) {
					self.update(null, rows[i], options);
				}
				return self;
			},
	
			// deletes row from table, updates indexes
			// - rows: table rows to delete
			// - options: [indexName]
			remove: function (rows, options) {
				var i;
				for (i = 0; i < rows.length; i++) {
					self.update(rows[i], null, options);
				}
				return self;
			},
	
			// selects specific rows from table preserving row ids or not
			// return value is always array (tight or dense)
			// - rowIds: specifies which rows to include in the result
			// - options:
			//	 - renumber: whether or not to preserve row ids
			select: function (rowIds, options) {
				// default options
				options = options || {};
	
				var result = [],
						i, rowId;
	
				// constructing result set
				if (options.renumber) {
					for (i = 0; i < rowIds.length; i++) {
						result.push(json[rowIds[i]]);
					}
				} else {
					for (i = 0; i < rowIds.length; i++) {
						rowId = rowIds[i];
						result[rowId] = json[rowId];
					}
				}
				return result;
			},
	
			// returns the first row as json table from the table fitting the conditions
			// - conditions: list of field-value pairs defining the data we're looking for; can be null = no filtering
			//	 (fields must be in the same exact order as in the index)
			// - options:
			//	 - indexName: index to use for search
			//	 - mode: $constants.exact, $constants.range, $constants.startof (not unicode!)
			//	 - renumber: whether or not to preserve row ids
			//	 - offset: search offset
			//	 - limit: munber of rows to return starting from offset
			where: function (conditions, options) {
				// default options
				options = options || {};
	
				var index = indexes.find(options.indexName, {row: conditions[0]}),
						rowIds, condition, range,
						lower, upper,
						selector;

				// index found, returning matching row by index
				if (index) {
					// obtaining row IDs for result
					switch (options.mode) {
					case $constants.range:
						condition = conditions ? $core.values(conditions[0])[0] : null;
						if (condition) {
							range = typeof condition === 'object' ? condition : {lower: condition, upper: condition};
							rowIds = index.range({
								lower: range.lower,
								upper: range.upper
							}, options);
						} else {
							rowIds = {lower: null, upper: null};
						}
						break;
					case $constants.startof:
						condition = conditions ? $core.values(conditions[0])[0] : null;
						lower = condition ? condition : null;
						upper = lower ? lower + 'z' : null;
						rowIds = index.range({ lower: lower, upper: upper }, options);
						break;
					default:
					case $constants.exact:
						// when offset and/or limit is specified, exact mode is not likely to work
						if (options.offset || options.limit) {
							$logging.warn("Running 'jOrder.table.where()' in 'exact' mode with offset and limit specified. Consider running it in 'range' mode.");
						}
						// when no conditions are set
						rowIds = conditions ?
							index.lookup(conditions) :
							$core.values(index.flat()); // what about grouped index?
						break;
					}
					
					// building result set based on collected row IDs
					return self.select(rowIds, { renumber: options.renumber });
				} else {
					// no index found, searching iteratively
					$logging.warn("No matching index for fields: '" + $core.keys(conditions[0]).join(',') + "'.");
					
					// obtaining suitable selector
					switch (options.mode) {
					case $constants.range:
						selector = $selectors.range;
						break;
					case $constants.startof:
						selector = $selectors.startof;
						break;
					default:
					case $constants.exact:
						selector = $selectors.exact;
						break;
					}
					
					// running iterative filter with found selector
					return self.filter(selector, options, {conditions: conditions});
				}
			},
	
			// aggregates the table using a group index
			// - indexName: name of the group index
			// - initCallback: function that initializes the aggregated row
			// - iterateCallback: function performing one step of iteration
			aggregate: function (indexName, initCallback, iterateCallback) {
				var result = {},
						index = indexes.find(indexName),
						groupIndex, groupId, items, seed, aggregated,
						i;

				// checking index
				if (!index.grouped()) {
					throw "Can't aggregate using a non-group index! Signature: '" + index.signature() + "'.";
				}
	
				// iterating over groups according to index
				$logging.warn("Aggregation iterates over table (length: " + json.length + ").");
				groupIndex = index.flat();
				for (groupId in groupIndex) {
					if (groupIndex.hasOwnProperty(groupId)) {
						// obtainig first available row (seed)
						items = groupIndex[groupId].items;
						for (i in items) {
							if (items.hasOwnProperty(i)) {
								seed = json[i];
								break;
							}
						}

						// initializing aggregated group with seed
						// optionally transformed by callback
						if (initCallback) {
							aggregated = iterateCallback(initCallback(seed), $core.deep(seed));
						} else {
							aggregated = $core.deep(seed);
						}
						
						// iterating over rows in group
						for (i in items) {
							if (items.hasOwnProperty(i) && json[i] !== seed) {
								aggregated = iterateCallback(aggregated, json[i]);
							}
						}
						
						// adding aggregated group to result
						result[groupId] = aggregated;
					}
				}
	
				return result;
			},
	
			// sorts the contents of the table according to an index
			// - fields: array of field names to sort by
			// - dir: $constants.asc or $constants.desc
			// - options:
			//	 - indexName: name of the index to use for sorting
			//	 - compare: comparer callback (UNUSED)
			//	 - offset
			//	 - limit
			orderby: function (fields, dir, options) {
				// default options
				options = options || {};
				dir = dir || $constants.asc;
	
				var index = indexes.find(options.indexName, {row: $core.join(fields, [])}),
						order, rowIds,
						i;
				
				// checking index validity
				if (index.type() === $constants.text) {
					throw "Can't order by free-text index: '" + fields.join(',') + "'.";
				}
				
				// assessing sorting order
				if (index.order) {
					// obtaining affected rowIds
					order = index.order(dir, options);
					rowIds = [];
					for (i = 0; i < order.length; i++) {
						rowIds.push(order[i].rowId);
					}
					// returning ordered rows
					return self.select(rowIds, { renumber: true });
				} else {
					// sorting on the fly
					$logging.warn("Unordered index or no index available. Sorting table on the fly.");
					return $core.shallow(json).sort(function (a, b) {
						return a[fields[0]] > b[fields[0]] ? 1 : a[fields[0]] < b[fields[0]] ? -1 : 0;
					});
				}
			},
	
			// filters table rows using the passed selector function
			// runs the selector on each row of the table
			// returns a json table
			// - selector: function that takes the row (object) as argument and returns a bool
			// - options:
			//	 - renumber: whether to preserve original row ids
			//	 - offset
			//	 - limit
			// - data: UNDOCUMENTED. required when used w/ default selectors
			filter: function (selector, options, data) {
				// issuing warning
				$logging.warn("Performing linear search on table (length: " + json.length + "). Consider using an index.");
	
				// applying default options
				options = options || {};
				options.offset = options.offset || 0;
	
				// initializing result
				var result = [],
						i, row, counter = 0;

				// sweeping entire table and selecting suitable rows
				for (i in json) {
					if (json.hasOwnProperty(i) && selector(row = json[i], data)) {
						if (counter++ >= options.offset) {
							if (options.renumber) {
								result.push(row);
							} else {
								result[i] = row;
							}
						}
						if (options.limit && counter === options.offset + options.limit) {
							break;
						}
					}
				}
				return result;
			},
	
			// counts the lements in the table
			count: function () {
				if (indexes.count()) {
					// using the first available index to check item count
					return indexes.find().count();
				} else {
					// no index: iterating over entire table and counting items one by one
					$logging.warn("Indexless row count iterates over table (length: " + json.length + ").");
					return $core.keys(json).length;
				}
			},
	
			// returns a copy of the flat contents of the table
			flat: function () {
				return json;
			},
	
			indexes: function () {
				return indexes;
			},
			
			// get the first row from table
			first: function () {
				var i;
				for (i in json) {
					if (json.hasOwnProperty(i)) {
						return json[i];
					}
				}
			},
	
			// returns one column of the table as a flat array
			// - field: field name identifying the column
			// - options:
			//	 - renumber: whether or not it should preserve row ids
			column: function (field, options) {
				// default options
				options = options || {};
	
				var result = [],
						i;
				if (options.renumber) {
					for (i in json) {
						if (json.hasOwnProperty(i)) {
							result.push(json[i][field]);
						}
					}
					return result;
				}
				for (i in json) {
					if (json.hasOwnProperty(i)) {
						result[i] = json[i][field];
					}
				}
				return result;
			}
		};
		
		// delegating methods from indexes
		// NOTE: delegated methods MUST NOT return reference to self!
		$core.delegate(indexes, self, {
			'ordered': true,
			'grouped': true
		});
		
		return self;
	};
}(jOrder.core,
	jOrder.constants,
	jOrder.logging,
	jOrder.indexes,
	jOrder.selectors);

