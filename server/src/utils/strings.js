/**
 * String related utilities.
 */
var RE_WHITESPACE = /(^\s+)|(\s+$)/,
    RE_SPLITTER = /\s*,\s*/,

strings = {
    /**
     * Trims leading and trailing whitespace from string.
     * @param value {string} Input string,
     * @returns {string} Trimmed string.
     */
    trim: function (value) {
        return value.replace(RE_WHITESPACE, '');
    },

    /**
     * Padded split. Splits string along padded commas.
     * @param value {string} String to be split.
     * @returns {Array} String elements.
     */
    split: function (value) {
        return value.split(RE_SPLITTER);
    }
};

exports.strings = strings;