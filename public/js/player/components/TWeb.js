// noinspection JSUnusedGlobalSymbols
class TWeb extends TCommonClass {

    constructor() {
        super("TWeb");
        this.tag = IFRAME_; //Önemli!
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }


    run(isAlternative,cb) {
        if (this.OK('file')) {
            let _src = this[CONTENT_][FILE_];
            this.addAttr("frameborder", 0);
            this.addAttr("vspace", 0);
            this.addAttr("hspace", 0);
            this.addAttr("webkitallowfullscreen", "true");
            this.addAttr("allowfullscreen", "true");
            this.addAttr("scrolling", "false");
            this.addAttr(CURRENTSRC_, _src);
            if (this.isItAppear) this.src = `${_src}?dt=${getDateTime2Url()}`;
            if (cb) cb(false);
        } else if (cb) cb(true);
    }
}
