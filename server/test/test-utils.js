////////////////////////////////////////////////////////////////////////////////
// Unit tests for the utils component
////////////////////////////////////////////////////////////////////////////////
/*global yalp, exports, console, module, ok, equal, deepEqual */
var test = function (test, utils) {
	test.utils = function () {
		module("Utils");
		
		////////////////////////////////////////////////////////////////////////////////
		
		var chain = exports.chain(function (elem) {
			return elem.toLowerCase();
		});
		
		function addStuff() {
			chain.add("A");
			chain.add("B");
			chain.add("E");
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
			
			chain.onFinished = function (result) {
				deepEqual(result, ["e", "b", "a"], "Iterated over entire chain");
				equal(chain.first(), null, "Full iteration empties chain");
				reset();
			};
			chain.onProgress = function () {
				console.log(chain.length());
			};
			
			// starting full iteration synchronously
			chain.start(false);
			
			// starting full iteration async
			chain.start();
			chain.stop();
			ok(chain.order().length > 0, "Chain has links left after iteration stopped");
		});
	};
	
	return test;
}(test || {},
	exports);

