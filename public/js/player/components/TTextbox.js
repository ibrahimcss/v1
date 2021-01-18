// noinspection JSUnusedGlobalSymbols
class TTextbox extends TCommonClass {
    constructor() {
        super("TTextbox");
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative,cb) {
        this.setBackgroundImage();
        if (this.OK('text')) this[INNER_HTML_] = decodeURIComponent(this.TEXT); // <text>
        cb(false);
    }
}
