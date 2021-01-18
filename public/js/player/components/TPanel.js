// noinspection JSUnusedGlobalSymbols
class TPanel extends TCommonClass {
    constructor() {
        super("TPanel");
        this.cpList = []; // Önemli!
        this.tickIsRun = false;
        this.masterIndex = -1;
    }

    get cpPLCount() {
        return this.cpList.length;
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    cpAddComp(plComponent) {
        this.cpList.push(plComponent);
    }

    run(isAlternative,cb) {
        let that = this;
        that.setBackgroundImage();

        if (that.OK(COMPONENTS_)) {
            that.removeCPList();
            that.tickIsRun = false
            let _compFunc = function (n) {
                if (n < that[CONTENT_][COMPONENTS_].length && that[CONTENT_][COMPONENTS_][n] !== UNDEFINED_) {
                    PLAYER.createComponent(that[CONTENT_][COMPONENTS_][n], that.element, (err, comp) => {
                        if (err) clog(err,"error");
                        else that.cpAddComp(comp);
                        comp[ISMASTER_] = comp[CONTENT_][ISMASTER_] ? true : false;
                        if (comp[ISMASTER_]) that.masterIndex = n;
                        _compFunc(++n);
                    }, false,isAlternative);
                } else cb(false);

            }
            _compFunc(0);
        } else cb();
    }

    tick() {
        let that = this;
        if (!that.tickIsRun) {
            that.tickIsRun = true;
            if (that.getParentComponent().className == TSCENE_) {
                (function f(x) {
                    if (x < that.cpPLCount) {
                        that.cpList[x].show();
                        that.childComponentShowControl(that.cpList, x);
                        f(++x);
                    }
                })(0)
            }
        }
    }
}

