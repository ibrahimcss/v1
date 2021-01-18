class TbrowserPlayer extends TbrowserComponents {
    constructor() {
        super();
        this.curtain = new TbrowserCurtain();
        this._scenario = null;
        this._weather = null;
        this._weatherFiles = null;
        this._finance = null;
        this._news = null;
        this._meeting = null;
        this._rule = null;

        this.stop();
    }

    get rule() {
        return this._rule;
    }

    set rule(v) {
        this._rule = v;
    }

    get scenario() {
        return this._scenario;
    }

    set scenario(v) {
        this._scenario = v;
    }

    get finance() {
        return this._finance;
    }

    set finance(v) {
        this._finance = v;
    }

    get news() {
        return this._news;
    }

    set news(v) {
        this._news = v;
    }

    get meeting() {
        return this._meeting;
    }

    set meeting(v) {
        this._meeting = v;
    }

    get weather() {
        return this._weather;
    }

    set weather(v) {
        this._weather = v;
    }

    get weatherfiles() {
        return this._weatherFiles;
    }

    set weatherfiles(v) {
        this._weatherFiles = v;
    }

    get state() {
        return this._state;
    }

    set state(v) {
        if (v.s === __play || v.s === __stop) {
            this._state = v.s;
            if (v.s === __play) this.doPlay(v.cb);
            else this.doStop(v.cb);
        } else clog("It has been wrong value assign for player.state!","error");
    }

    doPlay(cb) {
        let THAT = this;
        THAT.COMPS = [];
        if (this.scenario && typeof this.scenario === 'object' && this.scenario.hasOwnProperty('scene')) {
            if (this.scenario.hasOwnProperty(FILES_) && this.scenario[FILES_].length > 0) this.createFontStyle(this.scenario[FILES_])
            this.createComponent(this.scenario.scene, STAGE, (err, comp) => {
                if (!err) {
                    THAT.startTick();
                    THAT.curtain.openCurtain(() => {
                        if (cb) cb();
                        clog("P L A Y ", "success");
                    });
                } else clog(err);
            });
        } else this.stop(cb);
    }

    doStop(cb) {
        let THAT = this;
        this.stopTick();
        this.curtain.closeCurtain(() => {
            let e = document.querySelector("[id^='stage_']");
            if (e)
                THAT.destroyComponent(e, () => {
                    clog(" S T O P ", "error");
                    THAT.resetIDs();
                    if (cb) cb();
                });
        });
    }

    play(cb) {
        if (this.state !== __play) this.state = {s: __play, cb: cb}; else if (cb) cb();
    };

    stop(cb) {
        if (this.state !== __stop) this.state = {s: __stop, cb: cb}; else if (cb) cb();
    }

    progressBar(onOFF) {
        if (!pb_progress99.classList.contains('progress99')) pb_progress99.classList.remove('progress99');
        progressBar.style.display = onOFF ? 'block' : 'none';
        if (onOFF) pb_progress99.classList.add('progress99');
    }

    setTheScenario(s) {
        let t = this;
        this.stop(() => {
            clog("Gelen senaryo set edildi!", "success");
            t.scenario = s;
            t.play();
        });
    }


}
