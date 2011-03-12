////////////////////////////////////////////////////////////////////////////////
// Unit tests for the data component
////////////////////////////////////////////////////////////////////////////////
var test = function (test, data) {
	test.data = function () {
		var tag1 = 'test, abc,de:fg',
				tag2 = 'whatever/it /, is',
				media_bak = services.media;
				
		module("Data");
		
		/* Testing 'data.media' */

		// mock method
		services.getmedia = function (filter, handler) {
			handler({
				status: 'OK',
				data: [
					{mediaid: 1, path: "test/2.wmv", tags: ['sure:actor', 'lots:', 'test:'], rating: 3},
					{mediaid: 2, path: "test/1.wmv", tags: ['test:', 'abc:', 'what:'], rating: 5}
				]
			});
		};
		
		data.media.init();

		test("[media] First element of page", function () {
			equal(data.media.getFirst(0, 1)[0].mediaid, 2, "FIRST page");
			equal(data.media.getFirst(1, 1)[0].mediaid, 1, "SECOND page");
		});
		
		test("[media] Page retrieval", function () {
			deepEqual(data.media.getPage(0, 1), [{
				mediaid: 2,
				path: "test/1.wmv",
				tags: ['test:', 'abc:', 'what:'],
				rating: 5,
				file: "1.wmv",
				file_: "1.wmv",
				ext: undefined
			}], "FIRST page of length 1");
		});
		
		test("[media] Page count", function () {
			equal(data.media.getPages(1), 2, "Size 1");
			equal(data.media.getPages(2), 1, "Size 2");
		});

		services.getmedia = media_bak;

		/* Testing 'data.tag' */
		
		test("[tag] Tag splitting (spliting multiple tags along non-tag characters)", function () {
			deepEqual(data.tag(tag1).split(), ['test', 'abc', 'de:fg'], "Space and semicolon");
			deepEqual(data.tag(tag2).split(), ['whatever', 'it', 'is'], "Irregular separators");
		});

		test("[tag] Tag sanitation (removing non-tag characters)", function () {
			equals(data.tag(tag1).sanitize(), 'testabcde:fg', "Space and semicolon");
			equals(data.tag(tag2).sanitize(), 'whateveritis', "Irregular separators");
		});
		
		test("[tag] Tag matching (if tag macthes any in the user input)", function () {
			ok(data.tag(tag1).match('abc'), "Space and semicolon");
			ok(data.tag(tag2).match('is'), "Irregular separators");
		});
		
	};
	
	return test;
}(test || {},
	data);

