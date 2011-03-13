////////////////////////////////////////////////////////////////////////////////
// VLC Video Playback Tool
////////////////////////////////////////////////////////////////////////////////
var	tool = require('../tools/tool').tool,

vlc = function () {
	// inheriting from tool
	var self = Object.create(tool, {executable: {value: 'vlc'}});
	
	self.exec = function (path, args, handler) {
		tool.exec(args.concat([path]), handler, self);
	};
	
	return self;
}();

exports.vlc = vlc;

