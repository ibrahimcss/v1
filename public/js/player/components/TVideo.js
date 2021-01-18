// noinspection JSUnusedGlobalSymbols
class TVideo extends TCommonClass {

    constructor() {
        super("TVideo");
        this.tag = UCASE_VIDEO_; //Önemli!
        this.duration = LOOP_; // Önemli!
        /**
         * DURATION örnekleri; video ve componentplayer içindeki bileşenler için geçerlidir.
         * ----------------------------------------------------------------------------------
         * "loop"
         * "toEnd"
         * "16500"  // = 16.5 saniye
         * "8 laps" // 8 tur
         */
        this[CURRENT_TIME_] = 0;
    }

    get videoDuration() { // milisaniyeye dönüştürülerek döndürülüyor.
        return Math.round(Number(this[ELEMENT_].duration * 1000));
    }

    get currentTime() { // always milliseconds
        return Math.round(Number(this[ELEMENT_][CURRENT_TIME_] * 1000));
    }

    set currentTime(v) { // 'v' is always in milliseconds
        let v2 = Math.round(Number(v));
        if (this[ELEMENT_] && this[ELEMENT_][CURRENT_TIME_]) {
            this[ELEMENT_][CURRENT_TIME_] = (v2 <= 0 ? 0 : (v2 > this.videoDuration ? this.videoDuration : v2) / 1000);
        }
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative, cb) {
        if (this.OK('file')) {
            let that = this;
            let el = () => {
                that.element.removeEventListener('canplaythrough', el);
                that.element.removeEventListener('error', er);
                cb(false);
            };
            let er = (e, b) => {
                that.element.removeEventListener('canplaythrough', el);
                that.element.removeEventListener('error', er);
                console.error(e);
                console.error(b);
                cb(false);
            };
            this[ELEMENT_].type = "video/mp4";
            this[ELEMENT_].muted = "muted";
            this[ELEMENT_].loop = "loop";
            this[ELEMENT_].autoplay = "no";
            this[ELEMENT_].crossOrigin = "anonymous";
            // clog(this["FILE"]);
            this["src"] = this["FILE"];
            this[ELEMENT_].load();
            this[ELEMENT_].addEventListener('canplaythrough', el);
            this[ELEMENT_].addEventListener('error', er);
        } else if (cb) cb(true);
    }

    getToEnd(cb) {
        if (cb) cb(this, this.currentTime, this.videoDuration - ADDTICKTIME);
    }
}
