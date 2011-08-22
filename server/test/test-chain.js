////////////////////////////////////////////////////////////////////////////////
// Unit tests for the utils component
////////////////////////////////////////////////////////////////////////////////
/*global yalp, exports, console, setTimeout, module, ok, equal, deepEqual */
var test = function (test, utils) {
	test.chain = function () {
		module("Chain");
		
		////////////////////////////////////////////////////////////////////////////////
		
		var
		
		// chain with synchronous handler
		chain = exports.chain(function (elem) {
			return elem.toLowerCase();
		}),
		
		// same chain with asynchronous handler
		chainAsync = exports.chain(function (elem, finish) {
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
			chain
				.add("A")
				.add("B")
				.add("E");
		}
		
		// building chain
		addStuff();
		
		test("Construction", function () {
			var first = chain.first();
			
			deepEqual(chain.order(), ["E", "B", "A"], "Original order: E, B, A");
			equal(chain.length(), 3, "Chain length");
			ok(first.next.next.next === null, "Third link terminated (next == null)");
			ok(first.prev === null, "First -> null");
			ok(first.next.prev === first, "Second -> First");
			ok(first.next.next.prev === first.next, "Third -> Second");

			chain.clear();
			chain.add(["E", "B", "A"]);
			deepEqual(chain.order(), ["E", "B", "A"], "Order after adding batch: E, B, A");
		});
		
		function reset() {
			chain.clear();
			addStuff();
		}
		
		test("Manipulation", function () {
			chain.unlink("B");
			deepEqual(chain.order(), ["E", "A"], "Middle link removed");
			equal(chain.length(), 2, "Chain length");
			equal(chain.lookup("A").prev.load, "E", "E precedes A");

			chain.clear();
			equal(chain.first(), null, "Chain cleared");
			equal(chain.length(), 0, "Chain length");
			addStuff();

			chain.unlink("E");
			deepEqual(chain.order(), ["B", "A"], "First link removed");
			equal(chain.lookup("A").prev.load, "B", "B precedes A");
			reset();
			
			// bumping "B" to top
			chain.bump("B");
			deepEqual(chain.order(), ["B", "E", "A"], "B bumped up to top");
			equal(chain.length(), 3, "Chain length");
			chain.bump("A");
			deepEqual(chain.order(), ["A", "B", "E"], "A bumped up to top");
			chain.bump(["E", "B"]);
			deepEqual(chain.order(), ["E", "B", "A"], "E, B bumped up to top");
			reset();
		});
		
		test("Iteration", function () {
			var result = chain.next();
			equal(result, "e", "Iteration applies handler");
			deepEqual(chain.order(), ["B", "A"], "Iteration removes first link");
			reset();
						
			// starting full iteration synchronously
			chain
				.onFinished(function (result) {
					deepEqual(result, ["e", "b", "a"], "Iterated over entire chain");
					equal(chain.first(), null, "Full iteration empties chain");
					reset();
				})
				.onProgress(function () {
					console.log(chain.length());
				})
				.start();
			
			// starting full iteration asynchronously
			chainAsync
				.onFinished(function (result) {
					console.log(result, chainAsync.order());
				})
				.start(true);
		});
				
		test("Corner cases", function () {
			// iterating on empty chain does nothing
			chainAsync
				.clear()
				.start(true);
			equal(chainAsync.length(), 0, "Iterating on empty ASYNC chain does nothing");

			chainAsync
				.clear()
				.start();
			equal(chainAsync.length(), 0, "Iterating on empty SYNC chain does nothing");
		});
	};
	
	return test;
}(test || {},
	exports);

