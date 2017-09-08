const request = require('./request');
const area = process.env.DATAAREA || "zh-cn-zcyx";
const post_url = "http://v3.local-res-ots." + area + ".sky1088.com/netinfo";
console.log(post_url);

var postLog = function (sn, req, ip, port) {
    req = req.replace(/\r\n/g, '');
    var opt = {
        SerialNumber: sn,
        ConnTime: Math.round(new Date().getTime() / 1000),
        IPAddress: ip || "127.0.0.1",
        IPPort: port || 100,
        DataBuffer: '[SS]' + req,
        CopyCount: req.length
    };

    request.Post(post_url, opt, function (cc) {
        // console.log('request success ' + cc);
    }, function (err) {
        console.log('request fail ' + err);
    })
}

module.exports = {
    log: postLog
}