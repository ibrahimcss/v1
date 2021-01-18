// const TCommon = ('./components/TCommonClass');

class TbrowserComponents {

    constructor() {
        this.stopTick();
        //this.tickSubscribers = [];
        this._workerTick = null;
        this._tickCount = 0;
        this._iidd = [];
        this.COMPS = [];
        // this.ACOMPS = [];
        this.inAlternative = false;
        this.lastAlternativeElementID = null;
    }

    get tickCount() {
        return this._tickCount;
    }

    destroyComponent(element, cb) {
        let e = element;
        if (typeof element === 'string') e = document.getElementById(element);
        if (e) {
            let _func = function (E, _cb_) {
                if (E.firstChild) {
                    PLAYER.destroyComponent(E.firstChild, () => {
                        _func(E, () => _cb_());
                    });
                } else if (E && E.id) {
                    E.style.display = NONE_;
                    getComponents(E.id, (comp, indx) => {
                        if (comp) {
                            comp.beforeDestroy(() => {
                                E.parentNode.removeChild(E);
                                PLAYER.COMPS.splice(indx, 1);
                                _cb_();
                            });
                        }
                    })

                } else {
                    if (E) E.parentNode.removeChild(E);
                    _cb_();
                }
            };
            _func(e, () => cb());
        } else if (cb) cb();
    }

    createComponent(c, parent, cb, showHideMode = true, isAlternative) {
        let COMP = null;

        if (c.hasOwnProperty(CLASS_) && (!c.hasOwnProperty(ENABLED_) || c.enabled === true)) {

            /**
             * TODO: Unutma. waitForShow değeri milisaniye cinsinden
             * duration loop ise sürekli göster
             */
            try {
                // let _pushVariable = isAlternative ? "ACOMPS" : "COMPS";
                // let compInx = eval(`this.${_pushVariable}.push(eval("new " + c.class + "()")) - 1`);
                // COMP = eval(`this.${_pushVariable}[compInx]`);
                let compInx = this.COMPS.push(eval("new " + c.class + "()")) - 1;
                COMP = this.COMPS[compInx];
                COMP.tag = String(COMP.tag ? COMP.tag : "div").toLowerCase();
                COMP.element = document.createElement(COMP.tag);
                COMP.element.id = `${parent.id}_${this.getNextID(parent.id)}`;
                COMP.element.parentid = parent.id;
                clog(`Created : ${c.class} \tid : ${COMP.element.id}`);
                COMP.element.style.zIndex = "0";
                COMP.element.style.position = "absolute";
                COMP.element.setAttribute(COMPONENT_CLASS_, c.class);
                if (c.duration) COMP[DURATION_] = c.duration;
                if (c.delay) COMP[DELAY_] = c.delay;
                COMP.currentTime = 0;
                COMP.content = c;
                COMP.id = c.id; // 21.04.2020 04:16
                COMP[SHOW_IT_] = true;
                if (COMP.className === TCOMPONENT_PLAYER_) COMP[PLAY_LIST_OVER_] = false;
                if (COMP.content.style) Object.assign(COMP.element.style, COMP.content.style); // Assign CSS from JSON
                parent.appendChild(COMP.element);
                COMP.durationSetting();
                if (showHideMode === true && !isAlternative && COMP.canIShow()) COMP.show(); else COMP.hide();
                if (COMP.run) {
                    COMP.run(isAlternative, (cErr) => {
                        if (cErr) {
                            clog(`${COMP.className} create run error`, "error");
                            COMP[SHOW_IT_] = false;
                        }
                        if (cb) cb(null, COMP);
                    }, showHideMode);
                } else if (cb) cb(null, COMP);
            } catch (e) {
                clog(e, "error");
                if (cb) cb(e, null);
            }
        } else if (!c.hasOwnProperty(CLASS_)) {
            clog("CreateComponent: Bunu CREATE edemedim. Bileşene ait bir CLASS anahtarı yok, tanımlayamadım!", "error");
            clog(c);
            if (cb) cb("createComponent ERROR");
        } else if (cb) cb("component status is false"); // enabled = false
        return COMP;
    }

    createFontStyle(c, cb) {
        for (const fn of c) {
            if (typeof fn === OBJECT_ && fn.hasOwnProperty(DESC_) && fn.hasOwnProperty(FILE_)) {
                let fp = fileProp(fn[FILE_]);
                let t = "";
                switch (fp[1]) {
                    case OTF_:
                        t = "OpenType";
                        break;
                    case TTF_:
                        t = "truetype";
                        break;
                    case WOFF_:
                        t = WOFF_;
                        break;
                    case SVG_:
                        t = "svg";
                        break;
                    case EOT_:
                        t = "embedded-opentype";
                        break;
                }
                if (t) FONT_STYLE.appendChild(document.createTextNode(`@font-face {font-family:'${fn[DESC_]}'; src:url(${fdMEDIA + fp[1]}/${fp[0].split("font/").pop()});}`));
            }
        }
    }

    resetIDs() {
        this._iidd = [];
    }

    getNextID(p) {
        if (!this._iidd[p]) this._iidd[p] = 0;
        return ++this._iidd[p];
    }

    onWorkerTickMessage(e) {
        let that = this;
        that._tickCount += e.data;
        let p = that.COMPS.filter(x => x[CONTENT_] && x[CONTENT_][CONDITIONS_] && x[CONTENT_][CONDITIONS_].length > 0);
        if (that.inAlternative || (that._tickCount % 1000 == 0 && p.length > 0)) {
            // console.log(p);
            let i = 0;
            let n = false;
            let d = that.inAlternative;
            that.inAlternative = true;
            do {
                n = p[i].canIShow();
            }
            while (++i < p.length && !n);
            if (n) {
                let eid = p[i - 1]._element.id;
                that.COMPS[0][ISALTERNATIVE_] = true;
                that.lastAlternativeElementID = eid;
                getComponents(eid, (c) => {
                    c.getParentComponent()[ISALTERNATIVE_] = true;
                });
            } else {
                if (d) {
                    that.COMPS[0][ISALTERNATIVE_] = false;
                    getComponents(that.lastAlternativeElementID, (c) => {
                        c.getParentComponent()[ISALTERNATIVE_] = false;
                    });
                }
                that.inAlternative = false;
            }
        }

        for (const comp of that.COMPS) {
            if (typeof comp === OBJECT_ && comp.className) {
                // console.log(comp.className, comp.isItAppear);
                let cIS = comp.canIShow();
                let cPC = comp.getParentComponent();
                if (comp.isItAppear) {
                    if (!comp.mIDone() && comp.tick) {
                        comp.tick(that.tickCount); // It is sending the tick of time if it is appearing
                    }
                } else if (cPC.className === TSCENE_ && cIS && !comp[DURATION_OVER_]) {
                    if (!cPC.getParentComponent()) comp.show();
                } else if (cPC.className === TSCENE_ && !cIS && comp[DURATION_OVER_]) comp[DURATION_OVER_] = false;
                else if (comp[PLAY_LIST_OVER_] && cIS) {
                    for (const itemComp of comp.cpPlayList) {
                        if (itemComp.canIShow()) {
                            comp[PLAY_LIST_OVER_] = false;
                            comp.show()
                            break;
                        }
                    }
                }
            }
        }
    }

    stopTick() {
        if (this._workerTick) this._workerTick.terminate();
        this._workerTick = null;
        return this._tickCount = 0;
    }

    startTick() {
        if (!this._workerTick) {
            this._workerTick = new Worker("/js/player/workerTick.js");
            this._workerTick.onmessage = this.onWorkerTickMessage.bind(this);
        }
    }

    componentShowItControl(s) {
        let that = this;
        that.COMPS.filter(x => x.className == s && !x[SHOW_IT_]).forEach(c => {
            c.run(c[ISALTERNATIVE_], (cErr) => {
                if (!cErr) c[SHOW_IT_] = true;
            });
        });

        if (s == TNEWS_ || s == TFINANCE_ || s == TWEATHER_ || s == TMEETING_) {
            that.COMPS.filter(x => x.className == s && x[SHOW_IT_]).forEach(c => {
                c.run(c[ISALTERNATIVE_], (err) => {
                    if (err) {
                        clog(`${COMP.className} run error`);
                        c[SHOW_IT_] = false;
                    }
                });
            });
        }
    }

}
