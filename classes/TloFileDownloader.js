let __ftp = require('./TloFTP');
let httpDownload = require('./TloHTTPDownload');

module.exports = class TFileDownloader extends require('./TloUtils') {
    constructor() {
        super();
        this.fileSequence = [];
        this.weatherFiles = [];
        this.ftpRepositories = null;
        this.__f = new __ftp();
        this.__f.__init({
            onready: this.ftpReady.bind(this),
            onchunk: this.ftpChunk.bind(this)
        });
    }

    get fsLen() {
        return this.fileSequence.length;
    }

    ftpReady(fromFN) {
        this.player.playerSend({
            c: 'fileDownloading',
            fromFN: String(this.extractFilename(fromFN)).substr(0, 39)
        })
    }

    ftpChunk(fromFN, fSize, chunkTotal) {
        process.stdout.write(fromFN + " DOWNLOADING " + (100.0 * chunkTotal / fSize).toFixed(2) + "% " + chunkTotal + ' bytes\r');
        this.player.playerSend({
            c: 'fileChunk',
            fSize: fSize,
            chunkTotal: chunkTotal
        })
    }

    exMachineDownDoAll_YEAH(data, cb) {
        let files = data['files'];
        if (data['ftpRepositories']) this.ftpRepositories = data['ftpRepositories'];
        files.forEach(f => {
            if (f['file'].indexOf(this.fdWeatherFN) > 0 && this.weatherFiles.findIndex(x => x.id == f['id']) == -1) {
                this.weatherFiles.push({
                    file: f['file'].split('/').pop(),
                    id: f['id']
                });
            }
            this.fsAdd(f['file']);
        });
        if (this.fsLen > 0) {
            this.player.playerSend({ // hangi dosyaların olduğunu ve indirileceğini browsera gönderiliyor.
                c: 'downloadlist',
                l: this.fileSequence
            });
            this.downloadNext(cb);
        }
    }

    downloadNext(cb) {
        if (this.fsLen > 0) {
            let that = this;
            let c = this.fileSequence.shift();
            let fromProtocol = String(c['fname'].split(':')[0]);
            let fromFN = (fromProtocol.substr(0, 4).toLocaleLowerCase() === 'http') ? c['fname'] : '/' + c['fname'].split('://')[1];
            let toFNPath = this.pathResolve(this.fdMEDIAFILES, this.extractFilenExt(c['fname']));
            this.makeDir(toFNPath);
            let toFN = this.pathResolve(toFNPath, this.extractFilename(c['fname']));
            this.player.playerSend({
                c: 'fileChecking',
                f: String(this.extractFilename(fromFN)).substr(0, 39),
            });
            // console.log("toFN : "+toFN);
            if (!this.md5File(toFN)) {
                if (fromProtocol.substr(0, 4).toLocaleLowerCase() === 'http') {
                    // http/https download
                    httpDownload(fromProtocol, fromFN, toFN, (err) => {
                        if (err) {
                            that.clog(`TFileDownloader (HTTP): ${JSON.stringify(err)}`, "error");
                            if (c.trycount++ < Number(process.env.FTP_TRY_COUNT)) that.fileSequence.push(c);
                        } else that.clog('DOWNLOADED: ' + toFN);
                        c = null;
                        that.downloadNext(cb);
                    }, {
                        onready: this.ftpReady.bind(this),
                        onchunk: this.ftpChunk.bind(this)
                    });
                } else if (this.ftpRepositories && this.ftpRepositories[fromProtocol]) {
                    // FTP download
                    this.__f.__FTP(fromFN, toFN, (err) => {
                        if (err) {
                            that.clog(`TFileDownloader (FTP): ${JSON.stringify(err)}. ${fromFN}`, "error");
                            if (c && c.trycount++ < Number(process.env.FTP_TRY_COUNT)) that.fileSequence.push(c);
                        } else that.clog(`DOWNLOADED: ${toFN}`);
                        c = null;
                        that.downloadNext(cb);
                    }, this.ftpRepositories[fromProtocol]);
                } else if (this.ftpRepositories && !this.ftpRepositories[fromProtocol]) {
                    // protocol ERROR: FTP repo does not found
                    let ee = "TFileDownloader: ilgili protokol, gönderilen FTP depolarında bunamadı:" + fromFN;
                    that.clog(ee);
                    if (cb) cb(ee);
                } else {
                    // ERROR
                    let ee = "TFileDownloader: FTP deposu tanımlanmamış ve ilgili dosyanın nasıl indirileceği bilinmiyor: " + fromFN;
                    that.clog(ee);
                    if (cb) cb(ee);
                }
            } else {
                c = null;
                this.clog(`DOWNLOADED : Bu dosya mevcut ve MD5 doğru : ${fromFN}`);
                this.downloadNext(cb);
            }
        } else if (cb) cb();
    }

    fsAdd(fName) {
        if (!this.fileSequence.find(e => e === fName)) this.fileSequence.push({fname: fName, trycount: 0});
    }
};
