// noinspection JSUnusedGlobalSymbols
class TComponentPlayer extends TCommonClass {
    constructor() {
        super(TCOMPONENT_PLAYER_);
        this.cpPLIndex = -1; // Önemli!
        this.cpPlayList = []; // Önemli!
        // this.duration = TO_END_; // Önemli!
    }

    get cpPLCount() {
        return this.cpPlayList.length;
    }

    // get subComponents() {
    //     return this.cpPlayList;
    // }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    cpAddComp(plComponent) {
        this.cpPlayList.push(plComponent);
    }

    run(isAlternative,cb) {
        let xXx = 1;
        if (this.OK(PLAY_LIST_)) {
            let playList = this[CONTENT_][PLAY_LIST_];
            let that = this;
            this.setBackgroundImage(); // if there is...
            if (playList && typeof playList === OBJECT_ && playList.length > 0) {
                xXx = 0;
                let _func = function (n) {
                    if (n < playList.length && playList[n] !== UNDEFINED_) {
                        if (!isAlternative) isAlternative = playList[n][ISALTERNATIVE_];
                        PLAYER.createComponent(playList[n], that.element, (e, comp) => {
                            if (e) clog(e,"error");
                            else that.cpAddComp(comp);
                            if (isAlternative) comp[ISALTERNATIVE_] = true;
                            _func(++n);
                        }, false, isAlternative); // Hide olarak üretiliyor!
                    } else cb(false);
                };
                _func(0);
            } else clog('The key of called "playList" is empty in the content!',"error");
        } else clog("playList is not OK","error");
        if (xXx === 1) cb(true);
    }

    tick() {
        if (this.cpPLCount > 0 && this.cpPLIndex === -1) {
            if (this.getParentComponent().className == TSCENE_) {
                this.cpPlayList[++this.cpPLIndex].show();
                this.childComponentShowControl(this.cpPlayList, 0);
            }
        }
    }
}
