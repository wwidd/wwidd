////////////////////////////////////////////////////////////////////////////////
// Unit tests for the data component
////////////////////////////////////////////////////////////////////////////////
var test = function (test, data) {
	test.data = function () {
		var tag1 = 'test, abc,de:fg',
				tag2 = 'whatever/it /, is',
				kinds_bak = services.getkinds,
				media_bak = services.getmedia;
				
		module("Data");
		
		////////////////////////////////////////////////////////////////////////////////

		// mock method
		services.getkinds = function (handler) {
			handler({
				status: 'OK',
				data: [{kind: ""}, {kind: "abc"}, {kind: "test"}, {kind: "whatever"}, {kind: "this"}, {kind: "alpha"}, {kind: "bravo"}]
			});
		};
		
		data.kinds.init();

		test("[kinds] Reverse kind lookup (kind -> number)", function () {
			equal(data.kinds.getNumber('abc'), 'kind1', "abc");
			equal(data.kinds.getNumber('this'), 'kind4', "this");
		});
		
		services.getkinds = kinds_bak;
		
		////////////////////////////////////////////////////////////////////////////////

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

		////////////////////////////////////////////////////////////////////////////////
		
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

		////////////////////////////////////////////////////////////////////////////////
		
		data.tags.init();
		
		test("[tags] Searching for tag (name and kind)", function () {
			equal(data.tags.searchTag('lo'), 'lots:', "First tag starting with 'lo'");
			equal(data.tags.searchTag('sur'), 'sure:actor', "First tag starting with 'sur'");
		});

		test("[tags] Searching for tag name", function () {
			equal(data.tags.searchName('lo'), 'lots', "First tag name starting with 'lo'");
			equal(data.tags.searchName('sur'), 'sure', "First tag name starting with 'sur'");
			equal(data.tags.searchName('te'), 'test', "First tag name starting with 'te'");
		});
	};
	
	return test;
}(test || {},
	data);

