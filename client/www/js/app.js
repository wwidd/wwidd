/**
 * Application namespace. Global.
 * @type {Object}
 */
var app = {
    registerNameSpace: function (ns) {
        if (!app.hasOwnProperty(ns)) {
            app[ns] = {};
        }
        return app[ns];
    }
};
