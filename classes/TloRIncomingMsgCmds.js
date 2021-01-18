const screenshot = require('screenshot-desktop')
const fs = require('fs');

module.exports = class TloRIncomingMsgCmds extends require('./TloExpressApp') {
    constructor() {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    _theData(data, cb) {
        let that = this;
        let sfn;

        let fSave = (m, n, _cb) => {
            this.saveText(this.pathResolve(this.fdSCENARIO, m),
                JSON.stringify(n, null, 3),
                (err) => {
                    if (_cb) _cb(err);
                });
        }

        switch (data.title) {
            case "scenario":
                sfn = that.fdScenarioFilename;
                that.rmsSend("ITookTheScenario");
                break;
            case "news":
                sfn = that.fdNewsFilename;
                that.rmsSend("ITookTheNews");
                break;
            case "weather":
                sfn = that.fdWeatherFilename;
                that.rmsSend("ITookTheWeather");
                break;
            case "finance":
                sfn = that.fdFinanceFilename;
                that.rmsSend("ITookTheFinance");
                break;
            case "rule":
                sfn = that.fdRuleFilename;
                that.rmsSend("ITookTheRule");
                break;
            case "meeting":
                sfn = that.fdMeetingFilename;
                that.rmsSend("ITookTheMeeting");
                break;
        }


        if (sfn) {
            fSave(sfn, data.data, (err) => {
                if (err) that.clog(`Error: '${data.title}' could not write. ${JSON.stringify(err)}`, "error");
                else that.clog(`The file '${data.title}' was written.`);

                switch (data.title) {
                    case "rule":
                        that.rsControllerSend({cmd: "deviceRule", data: data});
                        break;
                    case "finance":
                        that.finance = data.data;
                        if (!that.intval) that.playerSend({c: "finance", d: that.finance});
                        break;
                    case "weather":
                        that.weather = data.data;
                        if (!that.intval) that.playerSend({c: "weather", d: that.weather});
                        break;
                    case "news":
                    case "meeting":
                    case "scenario":
                        if (!that.intval) that.intval = setTimeout(that.waitScenario.bind(that), that.timeOfWait);
                        break;
                }
            })
        }
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetSystemInformation() {
        let that = this;
        that.getSystemInformation((d) => {
            that.rmsSend("setSystemInformation", d);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetScreenShot() {
        let that = this;
        let fn = `Screenshot_${new Date().toISOString()}`.split(":").join("-");
        that.makeDir(that.pathResolve(that.fdSCREENSHOT));
        screenshot.all().then((imgs) => {
            if (imgs && imgs.length > 0) {
                let files = [];
                (function f(x) {
                    if (x < imgs.length) {
                        files.push({name: `Screen_${(x + 1)}`, base64: imgs[x].toString("base64")});
                        fs.writeFile(that.pathResolve(that.fdSCREENSHOT, `${fn}_${(x + 1)}.jpg`), imgs[x], 'binary', function (err) {
                            if (err) that.clog(`Error occurred while saving picture ${x}. Error : ${JSON.stringify({err})}`);
                            f(++x);
                        });
                    } else {
                        that.clog(`Screenshot Save Completed. Screen count : ${imgs.length}`);
                        that.rmsSend("setScreenShot", files);
                    }
                })(0);
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    _theSetEnablePServerLog() {
        this.sendRMS2Log = true;
    }

    // noinspection JSUnusedGlobalSymbols
    _theSetDisablePServerLog() {
        this.sendRMS2Log = false;
    }


    // noinspection JSUnusedGlobalSymbols
    _theSetEnablePClientLog() {
        this.sendRMS2ClientLog = true;
    }

    // noinspection JSUnusedGlobalSymbols
    _theSetDisablePClientLog() {
        this.sendRMS2ClientLog = false;
    }

    // noinspection JSUnusedGlobalSymbols
    _theSetEnablePRSLog() {
        this.sendRMS2RSLog = true;
    }

    // noinspection JSUnusedGlobalSymbols
    _theSetDisablePRSLog() {
        this.sendRMS2RSLog = false;
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetWeather() {
        this.rmsSendServerLog(this.weather);
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetWeatherFiles() {
        this.rmsSendServerLog(this.weatherFiles);
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetFinance() {
        this.rmsSendServerLog(this.finance);
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetScenario() {
        this.rmsSendServerLog(this.scenario);
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetNews() {
        this.rmsSendServerLog(this.news);
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetRule() {
        let that = this;
        that.readLocalData("rule", (err) => {
            if (err) that.clog("Rule read error.", "error");
            else that.rmsSendServerLog(that.rule);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetDownloadList() {
        this.rmsSendServerLog(this.fileSequence);
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientWeather() {
        this.playerSend({c: "getWeather"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientWeatherFiles() {
        this.playerSend({c: "getWeatherFiles"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientFinance() {
        this.playerSend({c: "getFinance"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientScenario() {
        this.playerSend({c: "getScenario"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientNews() {
        this.playerSend({c: "getNews"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponents() {
        this.playerSend({c: "getComponents"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTComponentPlayer() {
        this.playerSend({c: "getComponentsTComponentPlayer"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTPanel() {
        this.playerSend({c: "getComponentsTPanel"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTTextbox() {
        this.playerSend({c: "getComponentsTTextbox"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTNews() {
        this.playerSend({c: "getComponentsTNews"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTDatetime() {
        this.playerSend({c: "getComponentsTDatetime"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTFinance() {
        this.playerSend({c: "getComponentsTFinance"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTWeather() {
        this.playerSend({c: "getComponentsTWeather"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTVideo() {
        this.playerSend({c: "getComponentsTVideo"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theGetClientComponentsTImage() {
        this.playerSend({c: "getComponentsTImage"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theRunRSCommand(m) {
        if (m.hasOwnProperty("data") && m.data.hasOwnProperty("year") && m.data.hasOwnProperty("month") && m.data.hasOwnProperty("day")) {
            this.rsControllerSend({
                cmd: "deviceLog", data: {
                    year: m.data.year,
                    day: m.data.day,
                    month: m.data.month
                }
            });
        } else this.rsControllerSend({cmd: "run", data: m});
    }

    // noinspection JSUnusedGlobalSymbols
    _theServerRestart() {
        process.exit();
    }

    // noinspection JSUnusedGlobalSymbols
    _theClientRestart() {
        this.playerSend({c: "restart"});
    }

    // noinspection JSUnusedGlobalSymbols
    _theRSRestart() {
        this.rsControllerSend({cmd: "restart"});
    }

    // noinspection JSUnusedGlobalSymbols
    _pcRestart() {

    }

    // noinspection JSUnusedGlobalSymbols
    _theServerUpdate(c) {
        let that = this;
        switch (c.cmd) {
            case "player":
                if (process.env.PLAYER_AUTO_UPDATE == 1) that.updatePlayer(c.hash);
                else that.clog("Can not run update player. Player auto update is off.");
                break
            case "player_update":
                if (process.env.PLAYER_AUTO_UPDATE == 1) that.updatePlayerVersion(c.hash);
                else that.clog("Can not run update player version. Player auto update is off.");
                break
            case "rs232":
                if (process.env.RS_AUTO_UPDATE == 1) that.updateRS232(c.hash);
                else that.clog("Can not run update rs232. RS232 auto update is off.");
                break
            case "rs232_update":
                if (process.env.RS_AUTO_UPDATE == 1) that.updateRS232Version(c.hash);
                else that.clog("Can not run update rs232 version. RS232 auto update is off.");
                break
        }

    }

};
