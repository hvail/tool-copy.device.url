var deviceAttr = require('./CopyDeviceAttr');
var deviceBind = require('./CopyDeviceLink');

// var runAttr = function () {
//     deviceAttr.start();
// }

var start = function () {
    deviceBind.start();
    // deviceAttr.start();
    // deviceBind.start(deviceAttr.start);
}();