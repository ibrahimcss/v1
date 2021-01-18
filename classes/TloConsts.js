let httpDownload = require('./TloHTTPDownload');
const cp = require('child_process');

module.exports = class TConsts {
    #player;
    fdClasses = "classes";
    fdSCENARIO = "public/scenario";
    fdMEDIAFILES = this.fdSCENARIO;
    fdSCREENSHOT = "public/screenshot";
    fdCOMPONENTS = 'public/js/player/components';
    fdScenarioFilename = '___default.scenario';
    fdWeatherFilename = '___default.weather';
    fdFinanceFilename = '___default.finance';
    fdNewsFilename = '___default.news';
    fdRuleFilename = '___default.rule';
    fdMeetingFilename = '___default.meeting';
    fdWeatherFN = '/weather/';
    playerZipName = 'bdsplayer.zip';
    playerUpdateZipName = 'bdsplayer_update.zip';
    rs232ZipName = 'rs232.zip';
    rs232UpdateZipName = 'rs232_update.zip';
    intval = null;
    timeOfWait = 8000;

    get player() {
        return this.#player;
    }

    set player(v) {
        this.#player = v;
    }

    clearIntVal() {
        clearTimeout(this.intval);
        this.intval = null;
    }

    pm2Control(c, s) {
        let that = this;
        cp.exec(`pm2 ${c} ${s}`, function (err, d) {
            that.clog(`Run cmd command : pm2 ${c} ${s}.`);
            if (err) that.clog(`Run cmd error. Error : ${JSON.stringify(err)}`, "error");
        });
    }

    updatePlayer(h) {
        this.startUpdateFileProcess(this.playerZipName, h);
    }

    updatePlayerVersion(h) {
        this.startUpdateFileProcess(this.playerUpdateZipName, h);
    }

    updateRS232(h) {
        if (process.env.RS_PATH) this.startUpdateFileProcess(this.rs232ZipName, h);
        else this.clog('updateRS232 It is cancelled. RS_PATH not found in .env', "warn");
    }

    updateRS232Version(h) {
        if (process.env.RS_PATH) this.startUpdateFileProcess(this.rs232UpdateZipName, h);
        else this.clog('updateRS232Version It is cancelled. RS_PATH not found in .env', "warn");
    }

    startUpdateFileProcess(fn, md5Hash) {
        let that = this;
        let toFN = that.pathResolve(fn);
        that.clog(`Update file ${fn} start download.`)
        httpDownload("http", `http://${process.env.RMS_HOST}/${fn}`, toFN, (err) => {
            if (err) that.clog(`Update file download error. : ${JSON.stringify(err)}`, "error");
            else {
                that.clog(`Update file ${fn} downloaded.`, "success");
                let checkMD5 = that.getMd5(toFN) == md5Hash;
                that.clog(`Check MD5 hash : ${checkMD5}.`, "warn");
                if (checkMD5) {
                    let unzipDir = process.env.rootdirname;
                    let _f;
                    let _fname = "Player";

                    if (fn.indexOf("rs232") > -1) {
                        unzipDir = process.env.RS_PATH;
                        _f = that._theRSRestart.bind(this);
                        _fname = "RS232";
                    }
                    that.unzip(toFN, unzipDir);
                    that.clog(`${_fname} restart after 10 seconds.`);
                    setTimeout(() => {
                        if (_f) _f();
                        that._theServerRestart();
                    }, 10000);
                }
            }
        }, {
            onready: that.ftpReady.bind(this),
            onchunk: that.ftpChunk.bind(this)
        });
    }

};
