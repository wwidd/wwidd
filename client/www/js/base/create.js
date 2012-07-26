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

