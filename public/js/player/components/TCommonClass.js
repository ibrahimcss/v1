// noinspection JSUnusedGlobalSymbols
class TCommonClass {

    constructor(cn) {
        this.element = null;
        this.content = {};
        this.className = cn;
        this._enabled = true;
        this[ISALTERNATIVE_] = false;
        this[ISMASTER_] = false;
    }

    get content() {
        return this._content;
    }

    set content(v) {
        this._content = v;
    }

    get attributes() {
        return this._element.attributes;
    }


    get element() {
        return this._element;
    }

    set element(v) {
        this._element = v;
    }

    get isItAppear() {
        return this.element && this.element.style.display === BLOCK_;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(v) {
        if (Boolean(v) !== this._enabled) {
            this._enabled = Boolean(v);
            if (this.isItAppear && !this.enabled) this.hide();
            else if (!this.isItAppear && this.enabled) this.show();
        }
    }

    get innerText() {
        return String((this.element) ? this.element.innerText : '');
    }

    /*******************************************************************************************************************
     * htmlElement'e erişim HTML'de declare edildiği gibidir.
     */
    set innerText(v) {
        if (this.element) this.element.innerText = v;
    }

    get innerHTML() {
        return String((this.element) ? this.element.innerHTML : '');
    }

    set innerHTML(v) {
        if (this.element) this.element.innerHTML = v;
    }

    get src() {
        return String((this.element) ? this.element.src : '');
    }

    set src(v) {
        if (this.element) this.element.src = v;
        if (v != '') this.element.setAttribute("path", v);
    }

    get TEXT() {
        return (this[CONTENT_] && this[CONTENT_]["text"] ? String(this[CONTENT_]["text"]) : NA_);
    }

    get FORMAT() {
        return (this[CONTENT_] && this[CONTENT_]["format"] ? String(this[CONTENT_]["format"]) : NA_);
    }

    get FILE() {
        return (this[CONTENT_] && this[CONTENT_]["file"] ? String(fdMEDIA + this._filePrepare(this[CONTENT_]["file"])) : NA_);
    }

    get BACKGROUNDIMAGE() {
        let bi = this.content.backgroundImage;
        return bi ? String(fdMEDIA + this._filePrepare(bi)) : undefined;
    }

    pausePlayIfVideoOrIframe(e) {
        if (e.tagName === UCASE_VIDEO_) {
            if (e.style.display === NONE_) {
                e.pause();
                e.src = '';
            } else {
                e.src = e.getAttribute("path");
                e.load();
                e.play();
            }
        } else if (e.tagName === IFRAME_) {
            if (e.style.display === NONE_) e.src = '';
            else e.src = `${e.getAttribute(CURRENTSRC_)}?dt=${getDateTime2Url()}`;
        }
    }


    opacityBackUp() {
        this.currentOpacity = this.element.style.opacity;
        this.element.style.opacity = 0;
    }

    opacityBackDown() {
        this.element.style.opacity = this.currentOpacity;
        delete this.currentOpacity;
    }

    ___ShowHide(e, sh, anm) {
        let that = this;
        if (e) {
            let el = () => {
                e.style.display = sh;
                this.pausePlayIfVideoOrIframe(e);
                let es = e.querySelectorAll(`[${COMPONENT_CLASS_}]`);
                if (es.length > 0) {
                    (function f(x) {
                        if (x < es.length) {
                            getComponents(es[x].id, (comp, indx) => {
                                let k = () => {
                                    comp.element.style.display = sh;
                                    that.pausePlayIfVideoOrIframe(comp);
                                    f(++x);
                                }
                                if (sh == BLOCK_ && comp && comp[CONTENT_][ANIMATION_] && comp[CONTENT_][ANIMATION_][ANIMATION_SHOW_]) {
                                    comp.opacityBackUp();
                                    if (!isNaN(comp[DELAY_])) {
                                        let c = Number(comp[DELAY_]);
                                        if (c > 0) {
                                            let m1 = es[x];
                                            setTimeout(() => {
                                                m1.style.display = BLOCK_;
                                                that.pausePlayIfVideoOrIframe(m1);
                                            }, c)
                                            f(++x);
                                        }
                                    } else {
                                        // setTimeout(function () {
                                        k()
                                        // }, 75);
                                    }
                                    comp.addAnimate(comp[CONTENT_][ANIMATION_][ANIMATION_SHOW_]);
                                    comp.opacityBackDown();
                                } else {
                                    k();
                                    comp.hideTimeSetting();
                                }
                            });
                        } else es = null;
                    })(0)
                    // for (let i = 0; i < es.length; i++) {
                    //     getComponents(es[i].id, (comp, indx) => {
                    //         let k = () => {
                    //             if (comp.element.id == "stage_1_1_1_2" && sh == "flex") debugger;
                    //             console.log(comp.element.id, sh);
                    //             comp.element.style.display = sh;
                    //             that.pausePlayIfVideoOrIframe(comp);
                    //
                    //         }
                    //         if (sh == BLOCK_ && comp && comp[CONTENT_][ANIMATION_] && comp[CONTENT_][ANIMATION_][ANIMATION_SHOW_]) {
                    //             comp.opacityBackUp();
                    //             if (!isNaN(comp[DELAY_])) {
                    //                 let c = Number(comp[DELAY_]);
                    //                 if (c > 0) {
                    //                     let m1 = es[i];
                    //                     setTimeout(() => {
                    //                         m1.style.display = BLOCK_;
                    //                         that.pausePlayIfVideoOrIframe(m1);
                    //                     }, c)
                    //                 }
                    //             } else {
                    //                 setTimeout(function () {
                    //                     console.log("prprpr");
                    //                     k()
                    //                 }, 75);
                    //             }
                    //             comp.addAnimate(comp[CONTENT_][ANIMATION_][ANIMATION_SHOW_]);
                    //             comp.opacityBackDown();
                    //         } else {
                    //             k();
                    //             comp.hideTimeSetting();
                    //         }
                    //     });
                    // }
                }
                //es = null;
            }
            if (sh == BLOCK_ && anm) {
                that.opacityBackUp();
                setTimeout(() => {
                    el();
                }, 75)
            } else el();

        }
    };

    animateHide() {
        let that = this;
        // if (that.id=="DF296F6D942E1ADE") debugger;
        if (that[CONTENT_][ANIMATION_] && that[CONTENT_][ANIMATION_][ANIMATION_HIDE_]) {
            that.animatedHideStart = true;
            that.addAnimate(that[CONTENT_][ANIMATION_][ANIMATION_HIDE_]);
        }
    }

    hide() {
        let that = this;
        that.___ShowHide(that.element, NONE_);
        that.hideTimeSetting();
        // console.log(that._element);
        delete that[SHOW_STARTED_];
        if (that[STOP_]) that[STOP_]();
    }

    hideTimeSetting() {
        delete this.animatedHideStart;
        this.lastCurrentTime = this.currentTime;
        this.currentTime = 0;
        this.removeAnimate()
    }

    show() {
        let that = this;
        that.lastCurrentTime = 0;
        let fRun = () => {
            if (that.hasOwnProperty(CURRENT_RULE_PER_INDEX_) && that.canIShow()) ++that[CURRENT_RULE_PER_INDEX_];
            let isHaveShowAnimated = that[CONTENT_][ANIMATION_] && that[CONTENT_][ANIMATION_][ANIMATION_SHOW_];
            that.___ShowHide(that.element, BLOCK_, isHaveShowAnimated);
            if (isHaveShowAnimated) {
                that.addAnimate(that[CONTENT_][ANIMATION_][ANIMATION_SHOW_]);
                that.opacityBackDown();
            }
        }

        if (!that[SHOW_STARTED_]) {
            that[SHOW_STARTED_] = true;
            if (!isNaN(Number(that[DELAY_]))) {
                let c = Number(that[DELAY_]);
                if (c > 0) {
                    setTimeout(() => {
                        fRun();
                    }, c)
                }
            } else fRun();
        }

    }

    err(...args) {
        clog(`Error in ${this.className}:`, "error", ...args);
    }

    OK(hasOwn1, hasOwn2, hasOwn3) {
        let r = false;
        if (!this.element) clog('Firstly, the html element must be created by TbrowserComponent.', "error");
        else if (!this.content) clog('content is empty!', "error");
        else if (hasOwn1 && !this.content.hasOwnProperty(hasOwn1)) clog(`The key of called "${hasOwn1}" could not found in content!`, "error");
        else if (hasOwn2 && !this.content.hasOwnProperty(hasOwn2)) clog(`The key of called "${hasOwn2}" could not found in content!`, "error");
        else if (hasOwn3 && !this.content.hasOwnProperty(hasOwn3)) clog(`The key of called "${hasOwn3}" could not found in content!`, "error");
        else r = true;
        return r;
    }

    setBackgroundImage() {
        let bi = this.BACKGROUNDIMAGE;
        if (bi) {
            this[ELEMENT_].style.backgroundImage = `url('${bi}')`;
            // this[ELEMENT_].style.backgroundPosition = "center";
            // this[ELEMENT_].style.backgroundRepeat = "no-repeat";
            // this[ELEMENT_].style.backgroundSize = "cover";
        }
    }

    mIDone() {
        let that = this;
        let res = !that.canIShow();

        if (!res) {
            if (this.className !== TNEWS_ && !this.hasOwnProperty(DURATION_)) return false;
            let duration = Number(that[DURATION_]);
            if (!isNaN(duration)) {
                that[CURRENT_TIME_] = that[CURRENT_TIME_] + tickTime;
                let currentTime = Number(that[CURRENT_TIME_]);
                res = (currentTime >= duration);
                if (!res && !that.animatedHideStart && duration - currentTime <= 1000) that.animateHide();
            } else if (that.className == "TVideo" && that[GET_TO_END_]) {
                this[GET_TO_END_]((thatComp, currentValue, endValue) => {
                    // console.log(currentValue, endValue);
                    res = (currentValue >= endValue);
                    if (res) {
                        res = ++that[PIECE_] >= that[PIECE_MAX_];
                        if (res) that[PIECE_] = 0;
                    }
                });
            } else if (that.className === TNEWS_ && that[GET_TO_END_]) {
                that[CURRENT_TIME_] = that[CURRENT_TIME_] + tickTime;
                that[GET_TO_END_]((thatComp, currentValue, endValue) => {
                    let compIsLaps = !isNaN(Number(that[LAP_MAX_]));
                    res = (currentValue >= endValue);
                    if (res) {
                        if (!isNaN(Number(that[PIECE_MAX_]))) {
                            res = ++that[PIECE_] >= that[PIECE_MAX_];
                            if (res) {
                                that[PIECE_INDEX_] = that.newsIndex;
                                that[PIECE_] = 0;
                                that[PIECE_OVER_] = true;
                            }
                        } else if (compIsLaps) {
                            res = that[CURRENT_TIME_] % that.newsduration == 0;
                            if (res) {
                                res = ++that[LAPS_] >= that[LAP_MAX_];
                                if (res) that[LAPS_] = 0;
                            }
                        }
                    }
                });
            }
        }

        if (res) {
            that.hide();
            (function fParentShowControl(pCP, thatElement) {
                if (pCP) {
                    if (pCP.className === TCOMPONENT_PLAYER_) {
                        let fincreaseIndex = () => {
                            let around_index = 0;    //begin index
                            (function c() {
                                if (pCP.cpPLIndex === -1 || ++pCP.cpPLIndex >= pCP.cpPLCount) {
                                    ++around_index;
                                    pCP.cpPLIndex = 0;
                                }
                                if (pCP.cpPlayList[pCP.cpPLIndex].canIShow()) pCP.cpPlayList[pCP.cpPLIndex].show();
                                else if (around_index < 2) c();
                                else {
                                    pCP.hide();
                                    let p = pCP.getParentComponent();
                                    pCP.cpPLIndex = 0;
                                    if (p.className === TSCENE_) pCP[PLAY_LIST_OVER_] = true;
                                    fParentShowControl(p, pCP);
                                }
                            })()
                            thatElement.childComponentShowControl(pCP.cpPlayList, pCP.cpPLIndex);

                        }
                        if (isNaN(Number(pCP[DURATION_]))) {
                            if (!pCP[DURATION_]) fincreaseIndex();
                            else if (pCP[LAP_MAX_]) {
                                if (pCP.cpPLIndex == pCP.cpPLCount - 1) {
                                    if (++pCP[LAPS_] >= pCP[LAP_MAX_]) {
                                        pCP[LAPS_] = 0;
                                        pCP.hide();
                                        fParentShowControl(pCP.getParentComponent(), pCP);
                                    } else fincreaseIndex();
                                } else fincreaseIndex();
                            } else if (pCP[PIECE_MAX_]) {
                                if (((!isNaN(Number(thatElement.lastCurrentTime)) && thatElement.lastCurrentTime > 0) ||
                                    (isNaN(Number(thatElement[DURATION_])) && thatElement.lastCurrentTime == 0)) &&
                                    ++pCP[PIECE_] >= pCP[PIECE_MAX_]) {
                                    pCP[PIECE_INDEX_] = pCP.cpPLIndex + 1;
                                    pCP[PIECE_] = 0;
                                    if (pCP[PIECE_INDEX_] >= pCP.cpPLCount) pCP[PIECE_INDEX_] = 0;
                                    pCP.hide();
                                    fParentShowControl(pCP.getParentComponent(), pCP);
                                } else fincreaseIndex();
                            }
                        } else fincreaseIndex();
                    } else if (pCP.className === TSCENE_ && thatElement.canIShow()) thatElement[DURATION_OVER_] = true;
                    else if (pCP.className === TPANEL_) {
                        if (thatElement.canIShow()) thatElement[DURATION_OVER_] = true;
                        if (thatElement[ISMASTER_]) {
                            let fContinue = () => {
                                if (thatElement.canIShow()) {
                                    thatElement.show();
                                    thatElement.childComponentShowControl(pCP.cpList, pCP.masterIndex);
                                }
                            };
                            if (!pCP[DURATION_] && !thatElement[DURATION_OVER_]) fContinue();
                            else if (pCP[PIECE_MAX_]) {
                                if (((!isNaN(Number(thatElement.lastCurrentTime)) && thatElement.lastCurrentTime > 0) ||
                                    (isNaN(Number(thatElement[DURATION_])) && thatElement.lastCurrentTime == 0)) &&
                                    ++pCP[PIECE_] >= pCP[PIECE_MAX_]) {
                                    pCP[PIECE_] = 0;
                                    pCP.hide();
                                    fParentShowControl(pCP.getParentComponent(), pCP);
                                } else fContinue();
                            }
                        }
                    }

                }
            })(that.getParentComponent(), that);
        }
    }

    /*******************************************************************************************************************
     * jsonContent'e erişim
     * BÜYÜK harflerle yazılanlar jsonContent içinden alınır
     */

    _filePrepare(fn) { // uzantısına göre hangi klasörde?
        let ext = /^.+\.([^.]+)$/.exec(fn);
        return ext === null ? fn : `${ext[1]}/${fn}`
    }

    canIShow() {
        let res = false;
        let that = this;
        if (that[SHOW_IT_]) {
            if ((!PLAYER.inAlternative && !that[ISALTERNATIVE_]) || (PLAYER.inAlternative && that[ISALTERNATIVE_]) || (that.className == "News") || (that.className == "Meeting")) {
                let nDate = moment();
                if (that[CONTENT_].hasOwnProperty(CONDITIONS_) && that[CONTENT_][CONDITIONS_].length > 0) {
                    // console.log(that[CURRENT_RULE_DATE_], that[CURRENT_RULE_PER_INDEX_])
                    that[CONTENT_][CONDITIONS_].forEach((x) => {
                        if (!res) {
                            let bDate = moment(`${x[BEGINDATE_]} ${x[BEGINHOUR_]}`);
                            let eDate = moment(`${x[ENDDATE_]} ${x[ENDHOUR_]}`);
                            if (that.className == "Meeting" && !isNaN(Number(that[CONTENT_][EARLY_SHOW_TIME_]))) {
                                let c = Number(that[CONTENT_][EARLY_SHOW_TIME_]) * -1;
                                bDate.add(c, 'minutes');
                                // console.log(bDate.format('HH:mm:ss'));
                            }
                            res = (nDate >= bDate && nDate <= eDate);
                            if (res && x.hasOwnProperty(DAYS_) && x[DAYS_].length > 0) res = x.days.indexOf(parseInt(nDate.format("d"))) > -1;
                            if (res && x.hasOwnProperty(RULETYPE_) && x[RULETYPE_] == "showtime") {
                                bDate = moment(`2000-01-01 ${x[BEGINHOUR_]}`);
                                eDate = moment(`2000-01-01 ${x[ENDHOUR_]}`);
                                nDate = moment(`2000-01-01 ${nDate.format("HH:mm:ss")}`);
                                res = (nDate >= bDate && nDate <= eDate);
                            }
                            if (res && x[DAILYRULE_] == "limited") {
                                if (!that.hasOwnProperty(CURRENT_RULE_DATE_) || that[CURRENT_RULE_DATE_] != moment().format('DDMMYYYY')) {
                                    that[CURRENT_RULE_DATE_] = moment().format('DDMMYYYY');
                                    that[CURRENT_RULE_PER_INDEX_] = -1;
                                }
                                if (x.hasOwnProperty(DAILYPER)) res = that[CURRENT_RULE_PER_INDEX_] < x[DAILYPER];
                                if (that.className = "News" && res) ++that[CURRENT_RULE_PER_INDEX_];
                            }
                        }
                    })
                } else res = true;
                if (res == true && that.className === TCOMPONENT_PLAYER_ && that.cpPLCount > 0) {
                    let v = false;
                    (function cntrl(x) {
                        if (!v && x < that.cpPLCount) {
                            v = that.cpPlayList[x].canIShow();
                            cntrl(++x);
                        }
                    })(0);
                    res = v;
                }
            }
        }
        return res;
    }

    autoTextSize() {
        let that = this;
        if (that.element.style.height && that.element.style['font-size']) {
            let h = parseInt(that.element.style.height.split("px").join(''));
            let fs = parseInt(that[CONTENT_].style['font-size'].split("px").join(''));
            that.element.style.height = "unset";
            that.element.style.opacity = "0";
            that.element.style['font-size'] = fs;
            (function fH() {
                that.element.style['font-size'] = `${--fs}px`;
                if (that.element.offsetHeight < h) {
                    that.element.style.height = `${h}px`;
                    that.element.style.opacity = "1";
                } else fH();
            })();
        }
    }

    durationSetting() {
        let that = this;
        let duration = Number(that[DURATION_]);
        that.durationOver = false;

        if (isNaN(duration)) {
            delete that[PIECE_];
            delete that[PIECE_MAX_];
            delete that[LAPS_];
            delete that[LAP_MAX_];
            if (String(that[DURATION_]).indexOf(LAPS_) > 0) { // Tur Sayısı
                that[LAPS_] = 0;
                that[LAP_MAX_] = Number(String(that[DURATION_].substr(0, that[DURATION_].indexOf(LAPS_))).trim());
            } else if (String(this[DURATION_]).indexOf(PIECE_) > 0) { // Adetli Sayısı
                that[PIECE_] = 0;
                that[PIECE_INDEX_] = 0;
                that[PIECE_MAX_] = Number(String(that[DURATION_].substr(0, that[DURATION_].indexOf(PIECE_))).trim());
            }
        }
    }

    getParentComponent() {
        let that = this;
        let parentid = that.element.parentid;
        let i = PLAYER.COMPS.findIndex(x => x._element.id == parentid);
        if (i => -1) {
            return PLAYER.COMPS[i];
        }
    }

    childComponentShowControl(subcpPlayList, cpIndex) {
        if (subcpPlayList[cpIndex].className === TCOMPONENT_PLAYER_) {
            for (let n = 0; n < subcpPlayList[cpIndex].cpPLCount; n++) subcpPlayList[cpIndex].cpPlayList[n].hide();
            let ci = (subcpPlayList[cpIndex][PIECE_INDEX_]) ? subcpPlayList[cpIndex][PIECE_INDEX_] : 0;

            if (subcpPlayList[cpIndex].cpPlayList[ci].canIShow()) {
                subcpPlayList[cpIndex].cpPLIndex = ci;
                subcpPlayList[cpIndex].cpPlayList[ci].show();
            } else {
                let b = false;
                for (let n = ci; n < subcpPlayList[cpIndex].cpPLCount; n++) {
                    b = subcpPlayList[cpIndex].cpPlayList[n].canIShow();
                    if (b) {
                        subcpPlayList[cpIndex].cpPLIndex = n;
                        subcpPlayList[cpIndex].cpPlayList[n].show();
                        break;
                    }
                }

                if (!b) {
                    for (let n = 0; n < subcpPlayList[cpIndex].cpPLCount; n++) {
                        if (subcpPlayList[cpIndex].cpPlayList[n].canIShow()) {
                            subcpPlayList[cpIndex].cpPLIndex = n;
                            subcpPlayList[cpIndex].cpPlayList[n].show();
                            break;
                        }
                    }
                }
            }
            this.childComponentShowControl(subcpPlayList[cpIndex].cpPlayList, subcpPlayList[cpIndex].cpPLIndex);
        }
    }

    removeCPList() {
        let that = this;
        if (that.cpList && that.cpList.length > 0) {
            (function f(x) {
                if (x < that.cpList.length) {
                    if (that.cpList[x]) {
                        let sc = that.cpList[x]._element;
                        PLAYER.destroyComponent(sc, () => {
                            clog("%c Destroy 'TWeather' child elements for update.", "color:orange;");
                            f(++x);
                        });
                    } else f(++x);

                } else that.cpList = [];
            })(0);
        }
    }

    addAnimate(s, cb) {
        let that = this;
        that.removeAnimate(() => {
            that.element.classList.add("animate__animated");
            that.element.classList.add(`animate__${s}`);
        });
        setTimeout(() => {
            if (cb) cb();
        }, 1000);
    }

    removeAnimate(cb) {
        let that = this;
        if (that.element.classList.length > 0) {
            let c = that.element.classList.value.split(' ');
            c.forEach((x) => {
                that.element.classList.remove(x);
            })
            setTimeout(() => {
                if (cb) cb();
            }, 25);
        } else if (cb) cb();
    }


    addAttr(v, c) {
        return this._element.setAttribute(v, c);
    }

}
