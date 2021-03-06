var req = require('./my_modules/request');
var logger = require('./my_modules/OTSLogger');
var iconv = require('iconv-lite');
const get_count_url = "http://v3.local-manager-mssql.en-us.sky1088.com/custom/device-attr/count";
const get_page_url = "http://v3.local-manager-mssql.en-us.sky1088.com/custom/device-attr/page/SerialNumber/";
const response_header = "http://v3.local-manager-mssql.en-us.sky1088.com/custom/device-attr/page/SerialNumber/";
const request_header = "http://v3.local-manager-mongo.en-us.sky1088.com/custom/device-attr/";
const page_count = 2000;
var _page = 0;
var _total = 0, _index = 0;
var _sn = "CopyDeviceAttr";

var args = [];
if (process.argv.length > 2) args = process.argv.slice(2);

var getAccountCount = function (cb) {
    req.Get(get_count_url, function (cc) {
        cb && cb(cc);
    }, function (err) {
        console.log("getAccountCount Err");
        console.log(err);
    });
}

var getAccountByPage = function (page, cb) {
    var url = get_allUser_page_url + page;
    req.Get(url, function (data) {
        // console.log(data);
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
    var dn = obj.DisplayName;
    if (!dn) {
        obj.DisplayName = obj.SerialNumber;
    }
    else if (dn.indexOf("9460") >= 0) {
        obj.IMSI = obj.DisplayName.slice(1);
        obj.DisplayName = obj.SerialNumber;
    } else if (dn.indexOf('0xFFFF') == 0) {
        var __buff_str = obj.DisplayName.slice(10);
        var __buff = new Buffer(__buff_str, 'hex');
        var string = __buff.toString('utf16le');
        obj.DisplayName = string;
    } else if (/^\d+$/.test(dn) && dn[6] != 1 && dn.length > 10 && dn.length % 4 == 0) {
        var __buff_str = obj.DisplayName;
        var __buff = new Buffer(__buff_str, 'hex');
        var string = __buff.toString('utf16le');
        obj.DisplayName = string;
    }

// if (obj.DisplayName.length > 16 && /^\d+$/.test(obj.DisplayName)) {
//     console.log(obj.SerialNumber);
//     console.log(obj.DisplayName);
//     console.log(/^\d+$/.test(obj.DisplayName));
// }

    obj._id = (page - 1) * 2000 + i++;
    var objUrl = request_header + obj.SerialNumber;
    req.Post(objUrl, obj, function () {
        console.log("ATTR " + _index++ + " --> " + objUrl);
        runData(data, page, i, cb);
    });
}

var runPage = function (page, count, cb) {
    if (page >= count) {
        cb && cb();
        logger.log(_sn, (_sn + ' : RunEnd ' + '@ ' + new Date().toLocaleTimeString()));
        console.log('Run End');
        return;
    }
    var pageUrl = get_page_url + page++;
    // 利用回调循环比直接循环要好
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
        _total = count;
        var start = args.length >= 2 ? args[0] * 1 : 0,
            end = args.length >= 2 ? args[1] * 1 : page_c;

        console.log(count);
        console.log(start + ":" + end);
        runPage(start, end, cb);
    });
};

module.exports.start = start;