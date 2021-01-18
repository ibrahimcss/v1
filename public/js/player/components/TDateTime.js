// noinspection JSUnusedGlobalSymbols
class TDateTime extends TCommonClass {
    constructor() {
        super("TDateTime");
        this.TDateTimeCycle = 4; // DÖRT!
        this[CONTENT_]["lang"] = "en";
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative,cb) {
        moment.locale(this[CONTENT_]["lang"]);
        this.setBackgroundImage();
        if (this.OK('format')) {
            this.tick();
            cb(false);
        } else cb(true);
    }

    tick() {
        // 250 milisaniyede bir tick gelir
        if (++this.TDateTimeCycle >= 4) {
            this.TDateTimeCycle = 0;
            this[INNER_TEXT_] = moment().format(this[CONTENT_]["format"]);
        }
    }
}
