var req = require('./my_modules/request');
var iconv = require('iconv-lite');
const get_count_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/device-attr/count";
const get_page_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/device-attr/page/SerialNumber/";
const response_header = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/device-attr/page/SerialNumber/";
const request_header = "http://v3.local-manager-mongo.zh-cn.sky1088.com/custom/device-attr/";
const page_count = 2000;
var _page = 0;

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
    if (!obj.DisplayName) {
        obj.DisplayName = obj.SerialNumber;
    }
    else if (obj.DisplayName.indexOf("9460") >= 0) {
        obj.IMSI = obj.DisplayName.slice(1);
    } else if (obj.DisplayName.indexOf('0xFFFF') == 0) {
        var __buff_str = obj.DisplayName.slice(10);
        var __buff = new Buffer(__buff_str, 'hex');
        var string = __buff.toString('utf16le');
        // console.log(obj.DisplayName + ' ==> ' + string);
        obj.DisplayName = string;
    } else if (/^\d+$/.test(obj.DisplayName) && obj.DisplayName[6] != 1 && obj.DisplayName.length > 10 && obj.DisplayName.length % 4 == 0) {
        var __buff_str = obj.DisplayName;
        var __buff = new Buffer(__buff_str, 'hex');
        var string = __buff.toString('utf16le');
        // console.log(obj.DisplayName + ' ==> ' + string);
        obj.DisplayName = string;
    }

// if (obj.DisplayName.length > 16 && /^\d+$/.test(obj.DisplayName)) {
//     console.log(obj.SerialNumber);
//     console.log(obj.DisplayName);
//     console.log(/^\d+$/.test(obj.DisplayName));
// }
    obj._id = (page - 1) * 2000 + i++;
    var objUrl = request_header + obj.SerialNumber;
    // runData(data, page, i, cb);
    req.Post(objUrl, obj, function () {
        // console.log(obj);
        runData(data, page, i, cb);
    });
}

var runPage = function (page, count, cb) {
    if (page >= count) {
        cb && cb();
        console.log('Run End');
        return;
    }
    var pageUrl = get_page_url + page++;
    // 利用回调循环比直接循环要好
    req.Get(pageUrl, function (datajson) {
        var data = JSON.parse(datajson);
        runData(data, page, 0, function () {
            console.log('page is ' + page);
            runPage(page, count, cb);
        });
    });
}

var start = function (cb) {
    getAccountCount(function (count) {
        var page_c = Math.round(count / page_count);
        var start = args.length >= 2 ? args[0] * 1 : 0,
            end = args.length >= 2 ? args[1] * 1 : page_c;
        console.log(start + ":" + end);
        runPage(start, end, cb);
    });
};

module.exports.start = start;