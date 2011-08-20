////////////////////////////////////////////////////////////////////////////////
// General Purpose Linked Chain
//
// Manages prioritized queues, where elements can be added and removed,
// priorities changed while the queue is being processed. 
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, setTimeout */
var

// - handler: function to call on each element
chain = function (handler) {
	var stopped = true,		// whether processing is stopped
			first = null,			// pointer to first element in the chain
			lookup = {},			// lookup table value -> chain link
			length = 0,				// number of remaining links in chain
			total = 0,				// nulber of links in chain on starting process
	
	// applies a handler to one or more elements in reverse order
	batched = function (batch, handler) {
		var elems;
		if (typeof batch.pop !== 'function') {
			handler(batch);
		} else {
			elems = batch.concat([]);
			while (elems.length > 0) {
				handler(elems.pop());
			}
		}
	},
	
	// event handlers
	onFinished,			// runs when process finished
	onProgress,			// runs after processing each link

	self = {
		// adds an element to start of chain
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
		
		// removes an element from chain
		unlink: function (elem) {
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
				// current link is no more in the chain
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
		add: function (batch) {
			batched(batch, self.unshift);			
			return self;
		},
		
		// removes one or more elements from chain
		remove: function (batch) {
			batched(batch, self.unlink);			
			return self;
		},
		
		// clears chain
		clear: function () {
			first = null;
			lookup = {};
			length = 0;
			
			return self;
		},
		
		// bumps one or more elements up to top
		bump: function (elems) {
			// removing element(s) from chain
			self.remove(elems);
			
			// adding back element(s) at start
			self.add(elems);
			
			return self;
		},
		
		//////////////////////////////
		// Iteration

		// processes next element in queue
		// - finish: function to call when handler finishes
		next: function (finish) {
			// removing first link (shifting)
			var elem = first.load;
			self.unlink(elem);
			
			// running handler on load
			return handler(elem, finish);
		},
		
		// starts processing chain
		// - async: whether the handler (user supplied function) is asynchronous
		//   if so, handler must call 'finish(retval)' when finished
		start: function (async) {
			stopped = false;
			total = length;
			var result = [],
					next;
			
			// prodcesses return value of self.next() (continuation function)
			function finish(retval) {
				result.push(retval);
				if (onProgress) {
					onProgress(retval);
				}
				if (first !== null) {
					// jumping to next link in chain when processing is not stopped
					if (!stopped) {
						next();
					}
				} else {
					// chain underrun, stopping processing
					self.stop();
					if (onFinished) {
						onFinished(result);
					}
				}
			}
			
			// quasi-recursive iteration function
			next = function () {
				if (async) {
					self.next(finish);		// CPS
				} else {
					finish(self.next());	// direct
				}
			};
			
			// starting processing
			next();
			
			return self;
		},
		
		// stops processing chain
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
		
		// returns the chain load as an array
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
		
		// retrieves current chain length
		length: function () {
			return length;
		},
		
		// retrieves chain length at start
		total: function () {
			return total;
		},
		
		// returns progress of processing chain
		// returns float between 0 and 1
		// returns -1 when process is stopped
		progress: function () {
			if (stopped) {
				return -1;
			} else {
				return (total - length) / total;
			}
		},
		
		//////////////////////////////
		// Event setters

		onFinished: function (value) {
			onFinished = value;
			return self;
		},
		
		onProgress: function (value) {
			onProgress = value;
			return self;
		}
	};
	
	return self;
};

exports.chain = chain;

