////////////////////////////////////////////////////////////////////////////////
// Unit tests for the data component
////////////////////////////////////////////////////////////////////////////////
/*global app, document, module, ok, equal, equals, deepEqual, notEqual */
var test = function (test, data, services) {
	test.data = function () {
		var tag1 = 'test, abc,de:fg',
				tag2 = 'whatever/it /, is',
				media_bak = services.media.get;
				
		module("Data");
		
		////////////////////////////////////////////////////////////////////////////////
		
		test("[cookie] Setting a cookie", function () {
			data.cookie.set('test_key', 'test_value');
			notEqual(document.cookie.indexOf('test_key'), -1, "Cookie added.");
		});
		
		test("[cookie] Reading a cookie", function () {
			equal(data.cookie.get('test_key'), 'test_value', "Cookie read.");
		});

		test("[cookie] Erasing a cookie", function () {
			data.cookie.unset('test_key');
			equal(data.cookie.get('test_key'), undefined, "Cookie erased.");
		});

		////////////////////////////////////////////////////////////////////////////////

		// mock method
		services.media.get = function (filter, handler) {
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
		
		test("[media] Page count", function () {
			equal(data.media.getPages(1), 2, "Size 1");
			equal(data.media.getPages(2), 1, "Size 2");
		});

		services.getmedia = media_bak;

		////////////////////////////////////////////////////////////////////////////////
		
		test("[tag] Tag splitting (spliting multiple tags along non-tag characters)", function () {
			deepEqual(data.tag(tag1).split(), ['test', 'abc', 'de:fg'], "Splitting '" + tag1 + "'");
			deepEqual(data.tag(tag2).split(), ['whatever', 'it', 'is'], "Splitting '" + tag2 + "'");
		});

		test("[tag] Tag sanitation (removing non-tag characters)", function () {
			equals(data.tag(tag1).sanitize(), 'testabcde:fg', "Sanitizing '" + tag1 + "'");
			equals(data.tag(tag2).sanitize(), 'whateveritis', "Sanitizing '" + tag2 + "'");
		});
		
		test("[tag] Tag matching (if tag macthes any in the user input)", function () {
			ok(data.tag(tag1).match('abc'), "Searching 'abc' in '" + tag1 + "'");
			ok(data.tag(tag2).match('is'), "Searching 'is' in '" + tag2 + "'");
		});

		////////////////////////////////////////////////////////////////////////////////
		
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
	app.data,
	app.services);

