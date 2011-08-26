////////////////////////////////////////////////////////////////////////////////
// Unit tests for the utils component
////////////////////////////////////////////////////////////////////////////////
/*global yalp, exports, console, setTimeout, module, ok, equal, deepEqual */
var test = function (test, utils) {
	test.queue = function () {
		module("Queue");
		
		////////////////////////////////////////////////////////////////////////////////
		
		var
		
		// queue with synchronous handler
		queue = exports.queue(function (elem) {
			return elem.toLowerCase();
		}),
		
		// same queue with asynchronous handler
		queueAsync = exports.queue(function (elem, finish) {
			setTimeout(function () {
				var retval = elem.toLowerCase();
				finish(retval);
			}, 10);
			return null;
		})
			.add("A")
			.add("B")
			.add("E");
		
		
		function addStuff() {
			queue
				.add("A")
				.add("B")
				.add("E");
		}
		
		// building queue
		addStuff();
		
		test("Construction", function () {
			var first = queue.first();
			
			deepEqual(queue.order(), ["E", "B", "A"], "Original order: E, B, A");
			equal(queue.length(), 3, "Queue length");
			ok(first.next.next.next === null, "Third link terminated (next == null)");
			ok(first.prev === null, "First -> null");
			ok(first.next.prev === first, "Second -> First");
			ok(first.next.next.prev === first.next, "Third -> Second");

			queue.clear();
			queue.add(["E", "B", "A"]);
			deepEqual(queue.order(), ["E", "B", "A"], "Order after adding batch: E, B, A");
		});
		
		function reset() {
			queue.clear();
			addStuff();
		}
		
		test("Manipulation", function () {
			queue.unlink("B");
			deepEqual(queue.order(), ["E", "A"], "Middle link removed");
			equal(queue.length(), 2, "Queue length");
			equal(queue.lookup("A").prev.load, "E", "E precedes A");

			queue.unlink("B");
			deepEqual(queue.order(), ["E", "A"], "Removing non-existing element does nothing");
			
			queue.clear();
			equal(queue.first(), null, "Queue cleared");
			equal(queue.length(), 0, "Queue length");
			addStuff();

			queue.unlink("E");
			deepEqual(queue.order(), ["B", "A"], "First link removed");
			equal(queue.lookup("A").prev.load, "B", "B precedes A");
			reset();
			
			// bumping "B" to top
			queue.bump("B");
			deepEqual(queue.order(), ["B", "E", "A"], "B bumped up to top");
			equal(queue.length(), 3, "Queue length");
			queue.bump("A");
			deepEqual(queue.order(), ["A", "B", "E"], "A bumped up to top");
			queue.bump(["E", "B"]);
			deepEqual(queue.order(), ["E", "B", "A"], "E, B bumped up to top");
			reset();
		});
		
		test("Iteration", function () {
			var result = queue.next();
			equal(result, "e", "Iteration applies handler");
			deepEqual(queue.order(), ["B", "A"], "Iteration removes first link");
			reset();
						
			// starting full iteration synchronously
			queue
				.onFinish(function () {
					equal(queue.first(), null, "Full iteration empties queue");
					queue.flush();
					reset();
				})
				.onFlush(function (result) {
					deepEqual(result, ["e", "b", "a"], "Flushed results");					
				})
				.onProgress(function () {
					console.log(queue.length());
				})
				.start();
			
			// starting full iteration asynchronously
			queueAsync
				.onFinish(function (result) {
					console.log(result, queueAsync.order());
				})
				.start(true);
		});
				
		test("Corner cases", function () {
			// iterating on empty queue does nothing
			queueAsync
				.clear()
				.start(true);
			equal(queueAsync.length(), 0, "Iterating on empty ASYNC queue does nothing");

			queueAsync
				.clear()
				.start();
			equal(queueAsync.length(), 0, "Iterating on empty SYNC queue does nothing");
		});
	};
	
	return test;
}(test || {},
	exports);

