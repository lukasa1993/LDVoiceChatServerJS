/**
 * Created By:
 * User: lukasa
 * Date: 3/25/13
 * Time: 12:04 PM
 */

var ldHashmap = function LDHashMap() {
    var map = {}
        , elementCount = 0;

    return {
        addElement: function (key, value) {
            map[key] = value;
            elementCount++;
        },

        removeElement: function (key) {
            delete map[key];
            elementCount--;
        },

        getElement: function (key) {
            return map[key];
        },

        getElementCount: function () {
            return elementCount;
        },

//        getKeyArray: function () {
//            return Object.getOwnPropertyNames(map);
//        },
//
//        changeKeyOfElement: function (key, nKey) {
//            var tempStore = map[key];
//            delete map[key];
//            tempStore.name = nKey;
//            map[nKey] = tempStore;
//        },

        eachElement: function (callback) {
            Object.getOwnPropertyNames(map).forEach(function (val) {
                callback(map[val]);
            });
        }
    };
};

module.exports = ldHashmap;