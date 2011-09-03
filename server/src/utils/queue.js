////////////////////////////////////////////////////////////////////////////////
// General Purpose Process Queue
//
// Manages prioritized queues, where elements can be added and removed,
// priorities changed while the queue is being processed.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var

// - handler: function to call on each element
queue = function (handler) {
	var stopped = true,		// whether processing is stopped
			first = null,			// pointer to first element in the queue
			lookup = {},			// lookup table value -> queue link
			length = 0,				// number of remaining links in queue
			total = 0,				// nulber of links in queue on starting process
			result = {},			// results of processed elements
	
	// batched processing of elements
	// - elems: elements to apply handler to
	batched = function (elems, handler) {
		var tmp;
		if (typeof elems.pop !== 'function') {
			handler(elems);
		} else {
			tmp = elems.concat([]);
			while (tmp.length > 0) {
				handler(tmp.pop());
			}
		}
	},
	
	// event handlers
	onFinish,				// runs when process finished
	onProgress,			// runs after processing each link
	onFlush,				// runs after calling .flush

	self = {
		// adds an element to start of queue
		unshift: function (elem) {
			// current first becomes second
			var second = first;

			// constructing new first link
			first = {
				load: elem,
				prev: null,
				next: second
			};
			
			// updating second to point at first
			if (second) {
				second.prev = first;
			}
			
			// adding link to lookup
			lookup[elem] = first;
			length++;
			
			return self;
		},
		
		// removes an element from queue
		unlink: function (elem) {
			// checking whether elem is present in queue
			if (!lookup.hasOwnProperty(elem)) {
				return self;
			}
			
			// looking up link
			var link = lookup[elem],
					prev = link.prev,
					next = link.next;

			// removing reference from lookup
			delete lookup[elem];
			length--;
			
			if (link === first) {
				// removing first link
				first = link.next;
				if (first) {
					first.prev = null;
				}
			} else {					
				// pairing up previous and next links
				// current link is no longer in the queue
				if (prev) {
					prev.next = next;
				}
				if (next) {
					next.prev = prev;
				}
			}
			
			return self;
		},
		
		// adds one or more elements to start (in original order)
		add: function (elems) {
			var tmp = length;
			batched(elems, self.unshift);
			total += length - tmp;
			return self;
		},
		
		// removes one or more elements from queue
		remove: function (elems) {
			var tmp = length;
			batched(elems, self.unlink);
			total -= tmp - length;
			return self;
		},
		
		// clears queue
		clear: function () {
			first = null;
			lookup = {};
			length = 0;
			total = 0;
			result = {};
			
			return self;
		},
		
		// bumps one or more elements up to top
		bump: function (elems) {
			// removing element(s) from queue
			self.remove(elems);
			
			// adding back element(s) at start
			self.add(elems);
			
			return self;
		},
		
		// flushes results
		// - handler: optional callback, usually for ending request
		flush: function (handler) {
			var flushed = result,
					packed, elem;
			
			// emptying buffer
			result = {};
			
			if (onFlush || handler) {
				// packing result into array
				packed = [];
				for (elem in flushed) {
					if (flushed.hasOwnProperty(elem)) {
						packed.push(flushed[elem]);
					}
				}
				
				// calling handler
				if (onFlush) {
					onFlush(packed, handler);
				} else if (handler) {
					handler(packed);
				}
			}
			
			return self;
		},
		
		//////////////////////////////
		// Iteration

		// processes next element in queue
		// - finish: function to call when handler finishes
		next: function (finish) {
			if (first === null) {
				// queue underrun, stopping and wrapping up
				self.stop();
				if (onFinish) {
					onFinish();
				}
			} else {
				// removing first link (shifting)
				var elem = first.load,
						retval;				
				self.unlink(elem);
				
				// running handler on element
				if (finish) {
					handler(elem, function (retval) {
						result[elem] = retval;
						finish(retval);
					});
				} else {
					retval = handler(elem);
					result[elem] = retval;
					return retval;
				}
			}
			
			return self;
		},
		
		// starts processing queue
		// - async: whether the handler (user supplied function) is asynchronous
		//   if so, handler must call 'finish(retval)' when finished
		start: function (async) {
			if (!stopped) {
				return self;
			}
			
			stopped = false;

			// quasi-recursive iteration function
			var next = function () {
				if (stopped) {
					return;
				}
				if (async) {
					self.next(next);		// CPS
				} else {
					next(self.next());	// direct
				}
			};
			
			// starting processing
			next();
			
			return self;
		},
		
		// stops processing queue
		stop: function () {
			stopped = true;
			total = 0;
			
			return self;
		},
		
		//////////////////////////////
		// Getters

		// retrieves first link
		first: function () {
			return first;
		},
		
		// retrieves a link for a given element
		lookup: function (elem) {
			return lookup[elem];
		},
		
		// returns the queue load as an array
		// in the current order
		order: function () {
			var tmp = first,
					result = [];
			while (tmp !== null) {
				result.push(tmp.load);
				tmp = tmp.next;
			}
			return result;
		},
		
		// retrieves current queue length
		length: function () {
			return length;
		},
		
		// retrieves queue length at start
		total: function () {
			return total;
		},
		
		// returns progress of processing queue
		// returns float between 0 and 1
		// returns -1 when process is stopped
		progress: function () {
			if (stopped) {
				return -1;
			} else if (!total) {
				return 0;
			} else {
				return (total - length) / total;
			}
		},
		
		//////////////////////////////
		// Event setters

		onFinish: function (value) {
			onFinish = value;
			return self;
		},
		
		onProgress: function (value) {
			onProgress = value;
			return self;
		},
		
		onFlush: function (value) {
			onFlush = value;
			return self;
		}
	};
	
	return self;
};

exports.queue = queue;

