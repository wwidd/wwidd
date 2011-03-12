////////////////////////////////////////////////////////////////////////////////
// Unit tests for the data component
////////////////////////////////////////////////////////////////////////////////
var test = function (test, data) {
	test.data = function () {
		var test1 = 'test, abc,de:fg',
				test2 = 'whatever/it /, is';
				
		module("Data");
		
		/* Testing 'data.tag' */
		
		test("Tag splitting (spliting multiple tags along non-tag characters)", function () {
			deepEqual(data.tag(test1).split(), ['test', 'abc', 'de:fg'], "space and semicolon");
			deepEqual(data.tag(test2).split(), ['whatever', 'it', 'is'], "irregular separators");
		});

		test("Tag sanitation (removing non-tag characters)", function () {
			equals(data.tag(test1).sanitize(), 'testabcde:fg', "space and semicolon");
			equals(data.tag(test2).sanitize(), 'whateveritis', "irregular separators");
		});
		
		test("Tag matching (if tag macthes any in the user input)", function () {
			ok(data.tag(test1).match('abc'), "space and semicolon");
			ok(data.tag(test2).match('is'), "irregular separators");
		});
	};
	
	return test;
}(test || {},
	data);

