const URL = require('url');
var http = require('http');
const get_allUser_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account/count";
const get_allUser_page_url = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account/page/Id/";
const page_count = 2000;
const response_header = "http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account-device-view/master/";
const request_header = "http://v3.local-manager-mongo.zh-cn.sky1088.com/custom/account-device-link/";
const user_type = ["", "ClassUser", "Master", "NetUser", "Viewer", "Manager"];

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
        console.log(" - " + _id + ' - STATUS: ' + httpRes.statusCode + ":" + option.path);
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
    // console.log(url);
    requestGetUrl(url, function (data) {
        console.log(data);
        cb && cb(JSON.parse(data));
    }, function (err) {
        console.log("getAccountByPage Err");
        console.log(err);
    });
}

var getBindByUId = function (uid, cb, ii) {
    requestGetUrl(response_header + uid, function (jsondata) {
        // console.log(response_header + uid);
        var data = JSON.parse(jsondata);
        for (var i = 0; i < data.length; i++) {
            var bind = data[i];
            bind._id = ii;
            bind.UType = user_type[bind.UType];
            requestPostUrl(request_header + bind.SerialNumber, bind, 0, function (err) {
                console.log("requestGetUrl Err");
                console.log(err);
            });
        }
        cb && cb();
    }, function (err) {
        console.log("getBindByUId Err");
        console.log(err);
    });
}

getAccountCount(function (count) {
    var pages = count / page_count, i = 0;
    var bind_handler = function (data, ii, cb) {
        getBindByUId(data[ii].Id, function () {
            // console.log(data[ii].Id);
            if (ii++ < data.length - 1) {
                bind_handler(data, ii);
            } else cb && cb();
        }, ii);
    }
    var page_handler = function (page) {
        getAccountByPage(i++, function (data) {
            console.log("end page : " + page);
            bind_handler(data, page, function () {
                if (page++ < pages) page_handler(page);
            });
        });
    }
    page_handler(0);
    // console.log(pages);
    // getAccountByPage(i++, function (data) {
    //     bind_handler(data, 0);
    // });
    // while (i < pages)
    //     getAccountByPage(i++, function (data) {
    //         bind_handler(data, 0);
    //     });
})


// console.log(url.parse('http://v3.local-manager-mssql.zh-cn.sky1088.com/custom/account-device-view/master/'));