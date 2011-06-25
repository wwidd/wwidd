////////////////////////////////////////////////////////////////////////////////
// Unit tests for the utils component
////////////////////////////////////////////////////////////////////////////////
/*global yalp, exports, console, setTimeout, module, ok, equal, deepEqual */
var test = function (test, utils) {
	test.utils = function () {
		module("Utils");
		
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
		
		test("Chain construction", function () {
			var first = chain.first();
			
			deepEqual(chain.order(), ["E", "B", "A"], "Original order: E, B, A");
			equal(chain.length(), 3, "Chain length");
			ok(first.next.next.next === null, "Third link terminated (next == null)");
			ok(first.prev === null, "First -> null");
			ok(first.next.prev === first, "Second -> First");
			ok(first.next.next.prev === first.next, "Third -> Second");
		});
		
		function reset() {
			chain.clear();
			addStuff();
		}
		
		test("Chain manipulation", function () {
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
			reset();
		});
		
		test("Chain iteration", function () {
			var result = chain.next();
			equal(result, "e", "Iteration applies handler");
			deepEqual(chain.order(), ["B", "A"], "Iteration removes first link");
			reset();
						
			// starting full iteration synchronously
			chain.onFinished = function (result) {
				deepEqual(result, ["e", "b", "a"], "Iterated over entire chain");
				equal(chain.first(), null, "Full iteration empties chain");
				reset();
			};
			chain.onProgress = function () {
				console.log(chain.length());
			};
			chain.start();
			
			// starting full iteration asynchronously
			chainAsync.onFinished = function (result) {
				console.log(result, chainAsync.order());
			};
			chainAsync.start(true);
		});
	};
	
	return test;
}(test || {},
	exports);

