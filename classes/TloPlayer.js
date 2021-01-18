let fs = require('fs');

module.exports = class TPlayer extends require('./TloPComm') {
    #scenario;
    #rule;
    #weather;
    #news;
    #meeting;
    #finance;

    constructor() {
        super();
        this.player = this;
        this.scenario = null;
        this.rule = null;
        this.weather = null;
        this.finance = null;
        this.news = null;
        this.meeting = null;
        this.sendRMS2Log = false;
        this.sendRMS2ClientLog = false;
        this.sendRMS2RSLog = false;
        this.componentsFilesIsLoad = false;

    }

    get scenario() {
        return this.#scenario;
    }

    set scenario(v) {
        this.#scenario = v;
    }

    get rule() {
        return this.#rule;
    }

    set rule(v) {
        this.#rule = v;
    }

    get weather() {
        return this.#weather;
    }

    set weather(v) {
        this.#weather = v;
    }

    get finance() {
        return this.#finance;
    }

    set finance(v) {
        this.#finance = v;
    }

    get news() {
        return this.#news;
    }

    set news(v) {
        this.#news = v;
    }

    get meeting() {
        return this.#meeting;
    }

    set meeting(v) {
        this.#meeting = v;
    }

    doPlay() {
        this.playerIO.send({c: 'play'});
    }

    doStop() {
        this.playerIO.send({c: 'stop'});
    }

    waitScenario() {
        this.scenario = null;
        let that = this;
        that.clearIntVal();
        if (that.componentsFilesIsLoad) {
            that.readLocalData("weather", (wErr) => {
                if (wErr) that.clog("Weather read error.", "error")
                that.readLocalData("finance", (fErr) => {
                    if (fErr) that.clog("Finance read error.", "error")
                    that.readLocalData("news", (nErr) => {
                        if (nErr) that.clog("News read error.", "error")
                        that.readLocalData("meeting", (mErr) => {
                            if (nErr) that.clog("Meeting read error.", "error")
                            that.readLocalData("scenario", (sErr) => {
                                if (sErr) that.clog("Scenario read error.", "error");
                                let k = (n, m) => {
                                    that.doAnalyze(that.scenario, (err) => {
                                        if (that.weatherFiles.length > 0) that.playerSend({
                                            c: 'weatherfiles',
                                            d: that.weatherFiles
                                        });
                                        if (!wErr) that.playerSend({c: "weather", d: that.weather});
                                        if (!sErr) that.playerSend({c: 'scenario', d: that.scenario});
                                        if (!fErr) that.playerSend({c: "finance", d: that.finance});

                                        if (!n) that.playerSend({c: "news", d: that.news});
                                        if (!m) that.playerSend({c: "meeting", d: that.meeting});
                                        that.playerSend({c: 'theAnalyzeEnd'});
                                    })
                                }

                                let news_analyze = (_cb) => {
                                    that.doNewsAnalyze(that.scenario, that.news, (naErr) => {
                                        if (naErr) that.clog(`Error: News analysis failed. ${JSON.stringify(naErr)}`, "error")
                                        else that.clog("News analyse success done.", "success");
                                        if (_cb) _cb(naErr);
                                    });
                                }

                                let meeting_analyze = (_cb) => {
                                    that.doMeetingAnalyze(that.scenario, that.meeting, (maErr) => {
                                        if (maErr) that.clog(`Error: Meeting analysis failed. ${JSON.stringify(maErr)}`, "error")
                                        else that.clog("Meeting analyse success done.", "success");
                                        if (_cb) _cb(maErr);
                                    });
                                }

                                if (!nErr) {
                                    news_analyze((_na) => {
                                        if (!mErr) {
                                            meeting_analyze((_ma) => {
                                                k(_na, _ma);
                                            })
                                        } else k(_na, true);
                                    });
                                } else if (!mErr) {
                                    meeting_analyze((_ma) => {
                                        k(true, _ma);
                                    });
                                } else k(true, true);
                            });
                        });
                    });
                });
            });
        } else that.intval = setTimeout(that.waitScenario.bind(that), that.timeOfWait);

    }

    readLocalData(s, cb) {
        let that = this;
        let fn;
        switch (s) {
            case "weather":
                that.weather = null;
                fn = that.pathResolve(that.fdSCENARIO, that.fdWeatherFilename);
                break;
            case "finance":
                that.finance = null;
                fn = that.pathResolve(that.fdSCENARIO, that.fdFinanceFilename);
                break;
            case "news":
                that.news = null;
                fn = that.pathResolve(that.fdSCENARIO, that.fdNewsFilename);
                break;
            case "scenario":
                that.scenario = null;
                fn = that.pathResolve(that.fdSCENARIO, that.fdScenarioFilename);
                break;
            case "rule":
                that.rule = null;
                fn = that.pathResolve(that.fdSCENARIO, that.fdRuleFilename);
                break;
            case "meeting":
                that.meeting = null;
                fn = that.pathResolve(that.fdSCENARIO, that.fdMeetingFilename);
                break;
        }

        if (that.fileExists(fn)) {
            fs.readFile(fn, 'utf8', function (err, data) {
                if (!err) {
                    try {
                        let d = JSON.parse(data);
                        eval(`that.${s}=d;`);
                        cb(false);
                    } catch (e) {
                        that.clog(e);
                        cb(true);
                    }
                } else cb(true);
            });
        } else cb(true);
    }

    // noinspection JSUnusedGlobalSymbols
    _stop() {
        this.doStop();
    }

    // noinspection JSUnusedGlobalSymbols
    _play() {
        this.doPlay();
    }

    updateLastFTP() {
        let that = this;
        that.rmsSend("setLastFTP");
    }
};
