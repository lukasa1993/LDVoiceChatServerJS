/**
 * Created By:
 * User: lukasa
 * Date: 3/25/13
 * Time: 12:04 PM
 */

var ldHashmap = function LDHashMap(server, msgpack) {
    var map = {};

    return {
        addElement:         function (key, value) {
            map[key] = value;
        },
        removeElement:      function (key) {
            delete map[key];
        },
        getElement:         function (key) {
            return map[key];
        },
        changeKeyOfElement: function (key, nKey) {
            var tempStore = map[key];
            delete map[key];
            tempStore.name = nKey;
            map[nKey] = tempStore;
        },
        eachElement:        function (callback) {
            Object.getOwnPropertyNames(map).forEach(function(val, idx, array) {
                callback(map[val]);
            });
        }
    };
}

module.exports = ldHashmap;