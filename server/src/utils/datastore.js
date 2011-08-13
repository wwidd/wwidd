////////////////////////////////////////////////////////////////////////////////
// Datastore
//
// Datastore operations on JavaScript objects (nested hashtables)
////////////////////////////////////////////////////////////////////////////////
/*global exports */
var

datastore = {
	// get a datastore element at the given path
	// - path: array representing path
	// (expected to run on JS object)
	get: function (path) {
		var tpath = path.concat([]),
				tmp = this;
		while (tpath.length > 1) {
			tmp = tmp[tpath.shift()];
			if (typeof tmp === 'undefined') {
				throw "Invalid datastore path.";
			}
		}
		return tmp[tpath[0]];
	},
	
	// sets a datastore element at the given path
	// - path: array representing path
	// - value: value to be set at path
	// (expected to run on JS object)
	set: function (path, value) {
		var tpath = path.concat([]),
				next, tmp = this;
		while (tpath.length > 1) {
			next = tpath.shift();
			if (typeof tmp[next] === 'undefined') {
				tmp[next] = {};
			}
			tmp = tmp[next];
		}
		tmp[tpath[0]] = value;
		return this;
	}
};

exports.datastore = datastore;

