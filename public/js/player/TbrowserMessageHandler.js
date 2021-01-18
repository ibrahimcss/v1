class TbrowserMessageHandler extends TbrowserPlayer {
    constructor() {
        super();
    }

    processTheMessage(m) {
        let mj;

        try {
            mj = JSON.parse(m);
        } catch (e) {
            clog("ERROR (TbrowserMessageHandler.processTheMessage):", e);
        }
        // ------------------------------------------------------------------------
        if (!mj)
            return false;
        else if (mj.c === 'connectToRMS')
            this.pm_connectToRMS();
        else if (mj.c === 'disconnectFromRMS')
            this.pm_disconnectFromRMS();
        else if (mj.c === 'stop')
            this.pm_stop();
        else if (mj.c === 'play')
            this.pm_play();
        else if (mj.c === 'fileChunk')
            this.pm_fileChunk(mj.fSize, mj.chunkTotal);
        else if (mj.c === 'fileDownloading')
            this.pm_fileDownloading(mj.fromFN);
        else if (mj.c === 'downloadlist')
            this.pm_downloadlist(mj.l.length);
        else if (mj.c === 'scenario')
            this.pm_scenario(mj.d, mj.availableComponents);
        else if (mj.c === 'finance')
            this.pm_finance(mj.d);
        else if (mj.c === 'weather')
            this.pm_weather(mj.d);
        else if (mj.c === 'news')
            this.pm_news(mj.d);
        else if (mj.c === 'meeting')
            this.pm_meeting(mj.d);
        else if (mj.c === 'weatherfiles')
            this.pm_weatherfiles(mj.d);
        else if (mj.c === 'availableComponents')
            this.pm_availableComponents(mj.d);
        else if (mj.c === 'theAnalyzeBegin')
            this.pm_theAnalyzeBegin();
        else if (mj.c === 'theAnalyzeEnd')
            this.pm_theAnalyzeEnd();
        else if (mj.c === 'fileChecking')
            this.pm_fileChecking(mj.f);
        else if (mj.c === 'getWeather')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.weather});
        else if (mj.c === 'getWeatherFiles')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.weatherfiles});
        else if (mj.c === 'getFinance')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.finance});
        else if (mj.c === 'getScenario')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.scenario});
        else if (mj.c === 'getNews')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.news});
        else if (mj.c === 'getComponents')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS});
        else if (mj.c === 'getComponentsTComponentPlayer')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TComponentPlayer")});
        else if (mj.c === 'getComponentsTPanel')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TPanel")});
        else if (mj.c === 'getComponentsTTextbox')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TTextbox")});
        else if (mj.c === 'getComponentsTDatetime')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TDateTime")});
        else if (mj.c === 'getComponentsTNews')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TNews")});
        else if (mj.c === 'getComponentsTFinance')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TFinance")});
        else if (mj.c === 'getComponentsTWeather')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TWeather")});
        else if (mj.c === 'getComponentsTVideo')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TVideo")});
        else if (mj.c === 'getComponentsTImage')
            PLAYER.sendMessage({cmd: "log", data: PLAYER.COMPS.filter(x=> x.className=="TImage")});
        else if (mj.c === 'restart')
            location.reload();
        // ------------------------------------------------------------------------
        mj = null;
    }

    // noinspection JSUnusedGlobalSymbols
    pm_connectToRMS() {
        icon_disconnect.style.display = 'none';
    }

    // noinspection JSUnusedGlobalSymbols
    pm_disconnectFromRMS() {
        icon_disconnect.innerText = 'R'; // remote connection is lost
        icon_disconnect.style.display = 'block';
    }

    // noinspection JSUnusedGlobalSymbols
    pm_stop() {
        this.stop();
    }

    // noinspection JSUnusedGlobalSymbols
    pm_play() {
        this.play();
    }

    pm_downloadlist(fileListLength) {
        cnt_mainProcess = 0;
        cnt_mainProcessMax = fileListLength;
        pbdp_process.style.width = "0";
        pbdp_fileName.innerText = "";
        pbmain_process.style.width = "0";
        // if (progressBar.style.display !== 'block') this.progressBar(true);
    }

    pm_fileChecking(fileName) {
        clog(`FILE IS CHECKING: ${fileName}`, "warn");
        // if (progressBar.style.display !== 'block') this.progressBar(true);
        cnt_mainProcess++;
        let mpb = Math.round((cnt_mainProcess / cnt_mainProcessMax) * 100);
        pbmain_process.style.width = mpb + "%";
        pbdp_fileName.innerText = fileName;
    }

    pm_fileDownloading(fromFN) {
        if (progressBar.style.display !== 'block') this.progressBar(true);
        pbdp_fileName.innerText = fromFN;
        clog("FILE IS DOWNLOADING:", "info", fromFN);
    }

    pm_fileChunk(fSize, chunkTotal) {
        // if (progressBar.style.display !== 'block') this.progressBar(true);
        pbdp_process.style.width = Math.round((chunkTotal / fSize) * 100) + "%";
    }

    pm_scenario(DATA) {
        clog("Bir senaryo geldi...");
        if (!this.scenario
            || (DATA && this.scenario['scene'] && this.scenario['scene']['_id'] !== DATA['scene']['_id'])
            || (DATA && this.scenario['release'] !== DATA['release'])) {
            this.setTheScenario(DATA);
        } else if (DATA)
            clog("Gelen senaryo benimkiyle aynı!", "warn");
        else {
            clog("Gelen senaryo mesajı BOŞ!", "error");
            clog(JSON.stringify(DATA))
        }
        DATA = null;
    }

    pm_finance(DATA) {
        clog("Finans bilgisi geldi...");
        if (!this.finance || (DATA && this.finance['last_update'] !== DATA['last_update'])) {
            this.finance = DATA;
            this.componentShowItControl(TFINANCE_);
        } else if (DATA)
            clog("Gelen finans bilgisi benimkiyle aynı!", "warn");
        else {
            clog("Gelen finans bilgisi mesajı BOŞ!", "error");
            clog(JSON.stringify(DATA))
        }
        DATA = null;
    }

    pm_weather(DATA) {
        clog("Hava durumu bilgisi geldi...");
        if (!this.weather || (DATA && this.weather['last_update'] !== DATA['last_update'])) {
            this.weather = DATA;
            this.componentShowItControl(TWEATHER_);
        } else if (DATA)
            clog("Gelen hava durumu bilgisi benimkiyle aynı!", "warn");
        else {
            clog("Gelen hava durumu bilgisi mesajı BOŞ!", "error");
            clog(JSON.stringify(DATA))
        }
        DATA = null;
    }

    pm_news(DATA) {
        clog("Haber bilgisi geldi...");
        if (!this.news || DATA) {
            this.news = DATA;
            this.componentShowItControl(TNEWS_);
        } else if (!DATA) {
            clog("Gelen haber bilgisi boş!", "warn");
            clog(JSON.stringify(DATA))
        }
        DATA = null;
    }

    pm_meeting(DATA) {
        clog("Toplantı bilgisi geldi...");
        if (!this.meeting || DATA) {
            this.meeting = DATA;
            this.componentShowItControl(TMEETING_);
        } else if (!DATA) {
            clog("Gelen toplantı bilgisi boş!", "warn");
            clog(JSON.stringify(DATA))
        }
        DATA = null;
    }

    pm_weatherfiles(DATA) {
        clog("Hava durumunda kullanılacak olan görsellerin listesi geldi...");
        if (DATA && DATA.length > 0) {
            this.weatherfiles = DATA;
        } else {
            clog("Gelen hava durumu görsel listesi BOŞ!", "error");
            clog(JSON.stringify(DATA))
        }
        DATA = null;
    }

    pm_availableComponents(filenames) {
        let ac = String(filenames).split(",");
        let func_ = (x) => {
            if (x < ac.length && ac[x] !== "undefined")
                includeJS("player/components/" + ac[x], () => {
                    func_(++x);
                });
            else {
                ac = null;
                PLAYER.sendMessage({cmd: "componentsload"});
            }

        };
        if (ac.length > 0) func_(0); else ac = null;
    }

    pm_theAnalyzeBegin() {
        clog("analiz başladı");
        this.progressBar(true);
    }

    pm_theAnalyzeEnd() {
        clog("analiz bitti");
        this.progressBar(false);
    }
}
