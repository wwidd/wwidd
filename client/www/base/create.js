////////////////////////////////////////////////////////////////////////////////
// Object.create
////////////////////////////////////////////////////////////////////////////////
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		function F() {}
		F.prototype = o;
		return new F();
	};
}

if (typeof Object.isEmpty !== 'function') {
	Object.isEmpty = function (o) {
		var key;
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	};
}

