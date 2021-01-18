let ftpC = require('ftp');
let fs = require('fs');
module.exports = class TFTP {
    ftp_onReady;
    ftp_onChunk;
    ftp_Options;

    constructor(p) {
    }

    __init(o) {
        if (o && typeof o === 'object') {
            if (o.onready) this.ftp_onReady = o.onready;
            if (o.onchunk) this.ftp_onChunk = o.onchunk;
            if (o.options) this.ftp_Options = o.options;
        }
    }

    __FTP(fromFN, toFN, callBACK, opt) {
        if (opt) this.__init({options: opt});
        let ftpClient = new ftpC();
        let that = this;
        let chunkTotal = 0;
        ftpClient.on('ready', function () {
            ftpClient.size(fromFN, function (err, fSize) {
                if (!err) {
                    if (that.ftp_onReady && typeof that.ftp_onReady === 'function') that.ftp_onReady(fromFN, fSize);
                    ftpClient.get(fromFN, false, function (err2, stream) {
                        if (!err2) {
                            stream.once('close', function () {
                                ftpClient.end();
                                ftpClient = null;
                                if (callBACK) callBACK(chunkTotal !== fSize ? 'FTP Başarısız' : undefined);
                            });
                            if (that.ftp_onChunk && typeof that.ftp_onChunk === 'function') {
                                stream.on('data', chunk => {
                                    chunkTotal += chunk.length;
                                    that.ftp_onChunk(fromFN, fSize, chunkTotal);
                                });
                            }
                            stream.pipe(fs.createWriteStream(toFN));
                        } else {
                            console.log(`Error in __FTP.get: ${JSON.stringify(err2)}`,"error");
                            ftpClient = null;
                            if (callBACK) callBACK(err2);
                        }
                    });
                } else {
                    console.log(`Error in __FTP.size: ${JSON.stringify(err)}. ${fromFN}`, "error");
                    ftpClient = null;
                    if (callBACK) callBACK(err);
                }
            });
        });

        ftpClient.on('error', function (err3) {if (callBACK) callBACK(err3);});
        ftpClient.connect(this.ftp_Options);
    }
};
