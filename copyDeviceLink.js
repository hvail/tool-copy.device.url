const URL = require('url');
var http = require('http');

const get_allUser_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account/count";
const get_allUser_page_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account-device-link/page/UId/";
// const get_allUser_page_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account/page/Id/";
const page_count = 2000;
var _page = 0;
var _index = 0;
const response_header = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account-device-link/page/UId/";
const request_header = "http://v3.local-manager-mongo.zh-cn.sky1088.com/custom/account-device-link/";
const user_type = ["", "ClassUser", "Master", "NetUser", "Viewer", "Manager"];
console.log(process.argv);
var args = [];
if (process.argv.length > 2)
    args = process.argv.slice(2);

var requestGetUrl = function (url, cb, eb) {
    var option = URL.parse(url);
    option.method = "GET";

    var req = http.request(option, function (httpRes) {
        var buffers = [];
        httpRes.on('data', function (chunk) {
            buffers.push(chunk);
        });

        httpRes.on('end', function (chunk) {
            var wholeData = Buffer.concat(buffers);
            var dataStr = wholeData.toString('utf8');
            cb && cb(dataStr);
        });
    }).on('error', function (err) {
        eb && eb(err);
    });
    req.end();
}

var requestPostUrl = function (url, data, cb, eb) {
    var option = URL.parse(url);
    option.method = "POST";
    var _id = data._id;
    var req = http.request(option, function (httpRes) {
        if (_index % 20 == 0)
            console.log(_index++ + " - " + _id + ' - STATUS: ' + httpRes.statusCode + ":" + option.path);
        // if (httpRes.statusCode == 204) {
        //     cb && cb();
        //     return;
        // }
        var buffers = [];
        httpRes.on('data', function (chunk) {
            buffers.push(chunk);
        });

        httpRes.on('end', function (chunk) {
            var wholeData = Buffer.concat(buffers);
            var dataStr = wholeData.toString('utf8');
            cb && cb(dataStr);
        });
    }).on('error', function (err) {
        eb && eb(err);
    });
    delete data._id;
    req.write(JSON.stringify(data));
    req.end();
}

var getAccountCount = function (cb) {
    requestGetUrl(get_allUser_url, function (cc) {
        cb && cb(cc);
    }, function (err) {
        console.log("getAccountCount Err");
        console.log(err);
    });
}

var getAccountByPage = function (page, cb) {
    var url = get_allUser_page_url + page;
    requestGetUrl(url, function (data) {
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
    obj._id = page * 2000 + i++;
    var objUrl = request_header + obj.SerialNumber;
    requestPostUrl(objUrl, obj, function () {
        runData(data, page, i, cb);
    })
}

var runPage = function (page, count) {
    if (page >= count) {
        console.log('Run End');
        return;
    }
    var pageUrl = get_allUser_page_url + page++;
    requestGetUrl(pageUrl, function (datajson) {
        var data = JSON.parse(datajson);
        runData(data, page, 0, function () {
            // _page = page;
            // runPage(page, count);
        });
        runPage(page, count);
    });
}

getAccountCount(function (count) {
    // console.time('100-elements');
    // for (let i = 0; i < 100; i++) {
    //     ;
    // }
    // console.timeEnd('100-elements');
    var page_c = Math.round(count / page_count);
    var start = args.length >= 2 ? args[0] * 1 : 0,
        end = args.length >= 2 ? args[1] * 1 : page_c;

    console.log(start + ":" + end);
    runPage(start, end);
});

