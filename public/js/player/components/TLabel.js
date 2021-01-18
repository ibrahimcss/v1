// noinspection JSUnusedGlobalSymbols
class TLabel extends TCommonClass {
    constructor() {
        super("TLabel");
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative,cb) {
        if (this.OK('text')) this[INNER_TEXT_] = this.TEXT; // <text>
        cb(false);
    }
}

