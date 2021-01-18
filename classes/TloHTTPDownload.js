const http = require('http');
const https = require('https');
const fs = require('fs');
timeout = 10000;

module.exports = function httpDownload(protocol, fromFN, toFN, callback, opt) {
    let h = protocol === 'https' ? https : http;
    let request = h.get(fromFN).on('response', function (res) {
        if (res.statusCode == 200) {
            let len = parseInt(res.headers['content-length'], 10);
            fs.stat(toFN, (err, stat) => {
                if (!stat || !stat.size || len !== stat.size) {
                    let file = fs.createWriteStream(toFN);
                    if (opt && opt.onready && typeof opt.onready === 'function')
                        opt.onready(fromFN);
                    let downloaded = 0;
                    res.on('data', function (chunk) {
                        clearTimeout(timeoutId);
                        file.write(chunk);
                        downloaded += chunk.length;
                        if (opt && opt.onchunk && typeof opt.onchunk === 'function')
                            opt.onchunk(fromFN, len, downloaded);
                        timeoutId = setTimeout(fn, timeout);
                    }).on('end', function () {
                        clearTimeout(timeoutId);
                        file.end();
                        callback(null);
                    }).on('error', function (err) {
                        clearTimeout(timeoutId);
                        callback(err.message);
                    });
                    let timeout_wrapper = function (req) {
                        return function () {
                            req.abort();
                            callback("File transfer timeout!");
                        };
                    };
                    let fn = timeout_wrapper(request);
                    let timeoutId = setTimeout(fn, timeout);
                } else callback(null);
            });
        } else callback("File not found.");
    });
};
