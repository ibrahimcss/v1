class TScene extends TCommonClass {

    constructor() {
        super("TScene");
        this.sceneComponents = []; // Önemli!
    }

    get subComponents() {
        return this.sceneComponents;
    }

    beforeDestroy(cb) {
        this.sceneComponents = [];
        if (cb) cb();
    }

    run(isAlternative, cb, showHideMode) {
        let xXx = 1;
        if (this.OK(COMPONENTS_)) {
            let components = this[CONTENT_][COMPONENTS_];
            let that = this;
            this.setBackgroundImage(); // if there is...
            if (components && typeof components === OBJECT_ && components.length > 0) {
                xXx = 0;
                let _func = function (n) {
                    if (n < components.length && components[n] !== UNDEFINED_) {
                        let isShow = showHideMode;
                        if (components[n].hasOwnProperty(DELAY_) && components[n][DELAY_] > 0) isShow = false;

                        that.sceneComponents.push(
                            PLAYER.createComponent(components[n], that.element, (comp, bc) => {
                                _func(++n);
                            }, isShow, isAlternative));
                    } else cb(false);
                };
                _func(0);
            } else clog('The key of called "components" is empty in the content!',"error");
        }
        if (xXx === 1) cb(true);
    }
}
