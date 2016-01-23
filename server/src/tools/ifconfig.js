////////////////////////////////////////////////////////////////////////////////
// IP Config
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	system = require('../utils/system').system,
		parser = require('../utils/parser').parser,
		tool = require('../tools/tool').tool,

ifconfig = function () {
	var LOOPBACK = '0.0.0.0',
			IP4 = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g,
			IP4EX = /(127\.0\.0\.1|255\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\.255)/,
	
	executable = {'cygwin': 'ipconfig', 'windows': 'ipconfig'}[system.os] || 'ifconfig',
	
	self = Object.create(tool, {
		executable: {value: executable},
		binary: {value: true}
	});

	self.exec = function (handler) {
		tool.exec.call(self, [], function (code, stdout) {
			var result = LOOPBACK,
					i, ip, tmp;

			// acquiring IP address
			if (code === 0) {
				tmp = stdout.match(IP4) || [];
				for (i = 0; i < tmp.length; i++) {
					if (!IP4EX.test(tmp[i])) {
						result = tmp[i];
						console.log("IFCONFIG - detected IP: " + result);
						break;
					}
				}
				if (result === LOOPBACK) {
					console.log("IFCONFIG - no IP detected, using loopback IP");					
				}
			} else {
				console.log("IFCONFIG - ifconfig failed, using loopback IP");
			}
			
			if (handler) {
				handler(result);
			}
		}, true);

		return self;
	};
	
	return self;
}();

exports.ifconfig = ifconfig;

