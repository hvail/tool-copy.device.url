var req = require('./my_modules/request');
var logger = require('./my_modules/OTSLogger');
const get_allUser_url = "http://v3.local-manager-mssql.en-us.sky1088.com/custom/account-device-link/count";
const get_allUser_page_url = "http://v3.local-manager-mssql.en-us.sky1088.com/custom/account-device-link/page/UId/";
const response_header = "http://v3.local-manager-mssql.en-us.sky1088.com/custom/account-device-link/page/SerialNumber/";
const request_header = "http://v3.local-manager-mongo.en-us.sky1088.com/custom/account-device-link/";
const page_count = 2000;
var _page = 0;
var _sn = "CopyDeviceLink";
const user_type = ["", "ClassUser", "Master", "NetUser", "Viewer", "Manager"];

var args = [];
if (process.argv.length > 2) args = process.argv.slice(2);

var getAccountCount = function (cb) {
    req.Get(get_allUser_url, function (cc) {
        cb && cb(cc);
    }, function (err) {
        console.log("getAccountCount Err");
        console.log(err);
    });
}

var getAccountByPage = function (page, cb) {
    var url = get_allUser_page_url + page;
    req.Get(url, function (data) {
        console.log(data);
        cb && cb(JSON.parse(data), page);
    }, function (err) {
        console.log("getAccountByPage Err");
        console.log(err);
    });
}

var runData = function (data, page, i, cb) {
    if (i >= data.length) {
        cb && cb();
        return;
    }
    var obj = data[i];
    obj.UType = user_type[obj.UType];
    obj._id = (page - 1) * 2000 + i++;
    var objUrl = request_header + obj.SerialNumber;
    req.Post(objUrl, obj, function () {
        console.log(objUrl);
        runData(data, page, i, cb);
    });
}

var runPage = function (page, count, cb) {
    if (page >= count) {
        cb && cb();
        logger.log(_sn, _sn + ' : RunEnd ' + '@ ' + new Date().toLocaleTimeString());
        console.log('Run End');
        return;
    }
    var pageUrl = get_allUser_page_url + page++;
    // 利用回调循环比多循环要好
    req.Get(pageUrl, function (datajson) {
        var data = JSON.parse(datajson);
        runData(data, page, 0, function () {
            logger.log(_sn, (_sn + ' : page is ' + page + ' @ ' + new Date().toLocaleTimeString()));
            console.log(_sn + ' : page is ' + page + ' @ ' + new Date().toLocaleTimeString());
            runPage(page, count, cb);
        });
    });
}
var start = function (cb) {
    getAccountCount(function (count) {
        var page_c = Math.round(count / page_count);
        var start = args.length >= 2 ? args[0] * 1 : 0,
            end = args.length >= 2 ? args[1] * 1 : page_c;

        console.log(count);
        console.log(start + ":" + end);
        runPage(start, end, cb);
    });
}

module.exports.start = start;

