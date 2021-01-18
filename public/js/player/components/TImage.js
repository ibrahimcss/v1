// noinspection JSUnusedGlobalSymbols
class TImage extends TCommonClass {
    constructor() {
        super("TImage");
        this.tag = "img"; //div değilse belirt!
    }

    beforeDestroy(cb) {
        this.src = '';
        if (cb) cb();
    }

    run(isAlternative,cb) {
        if (this.OK("file")) {
            this.src = this.FILE;
            if (cb) cb(false);
        } else if (cb) cb(true);
    }
}
