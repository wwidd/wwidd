////////////////////////////////////////////////////////////////////////////////
// Unit tests for the data component
////////////////////////////////////////////////////////////////////////////////
/*global yalp, datastore, module, ok, equals, raises */
var test = function (test, datastore) {
	test.datastore = function () {
		var ds = {};
		
		/*jslint sub:true */
		ds['first'] = {};
		ds['first']['a'] = {};
		ds['first']['b'] = {};
		ds['first']['c'] = {};
		ds['first']['d'] = {};
		ds['first']['e'] = {};
		ds['second'] = {};
		ds['second'][1] = {};
		ds['second'][2] = {};
		ds['second'][3] = {};
		ds['third'] = {};
		ds['fourth'] = {};
		/*jslint sub:false */
		
		module("Datastore");
		
		test("Accessing values", function () {
			ok(datastore.get.call(ds, ['first', 'a']), "Path 'ds.first.a' is defined");
			ok(!datastore.get.call(ds, ['first', 'f']), "Path 'ds.first.f' is undefined");
			raises(function () {
				datastore.get.call(ds, ['fifth', 'a']);
			}, null, "Invalid path raises exception");
		});
		
		test("Modifying values", function () {
			datastore.set.call(ds, ['first', 'a'], 1);
			equals(ds.first.a, 1, "Setting value on existing path (ds.first.a)");
			
			datastore.set.call(ds, ['thousandth', 'x', 5], 1000);
			equals(ds.thousandth.x[5], 1000, "Setting value on non-existing path (ds.thousandth.x.5)");
			
			delete datastore.get.call(ds, ['thousandth', 'x'])[5];
			ok(typeof ds.thousandth.x[5] === 'undefined', "Deleting value from datastore (ds.thousandth.x.5)");			
		});
	};
	
	return test;
}(test || {},
	datastore);

