let md5file = require('md5-file');
let path = require('path');
let fs = require('fs');
let unzipper = require('unzipper');

module.exports = class TUtils extends require('./TloSystemInfo') {

    clog(message, style) {
        switch (style) {
            case "error":
                console.log('\x1b[1;31mERROR:\x1b[0m ', message);
                break;
            case "success":
                console.log('\x1b[1;32m%s\x1b[0m', message);
                break;
            case "warn":
                console.log('\x1b[1;33m%s\x1b[0m', message);
                break;
            default:
                console.log(message);
                break
        }
        this.setupControllerSend(message);
        this.rmsSendServerLog({message: message, status: style})
    }

    md5File(fn) {
        if (this.fileExists(fn)) {
            let p = path.parse(fn);
            if (p.name.length === 32) {
                return (md5file.sync(fn) === p.name);
            } else return false;
        } else return false;
    }

    getMd5(fn) {
        if (this.fileExists(fn)) {
            return md5file.sync(fn);
        } else return false;
    }


    extractFilename(fn) {
        return path.parse(fn).base;
    }

    extractFilenExt(fn) {
        return path.parse(fn).ext.substr(1, 12);
    }

    unzip(fn, toFN) {
        fs.createReadStream(fn).pipe(unzipper.Extract({path: toFN}));
    }

    fileExists(fn) {
        return fs.existsSync(fn);
    }

    readFile(fn, cb) {
        if (this.fileExists(fn)) {
            fs.readFile(fn, 'utf8', function (err, data) {
                if (!err) {
                    if (cb) cb(false, data)
                } else if (cb) cb(true);
            });
        } else if (cb) cb(true);
    }

    // Root dizini otomatik ekler...
    pathResolve(...args) {
        return path.resolve(process.env.rootdirname, ...args);
    }

    saveText(fn, text, cb) {
        if (this.fileExists(fn)) fs.unlinkSync(fn);
        fs.writeFile(fn, text, (err) => {
            if (cb) cb(err);
        });
    }

    makeDir(dir, cb) {
        fs.mkdir(dir, {recursive: true}, () => {
            if (cb) cb()
        });
    }

    listDirectory(path, cb) {
        fs.readdir(path, (err, files) => {
            if (cb) cb(err ? [] : files);
        });
    }
}
;
