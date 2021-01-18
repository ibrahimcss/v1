'use strict';
class TbrowserCurtain {

    constructor() {
        this.curtains = document.getElementsByClassName("curtain");
        this.roroIval = 0;
    }

    roro(s, cb) {
        if (this.roroIval > 0) clearTimeout(this.roroIval);
        let act = (s === __open ? 'remove' : 'add');
        let timeout = (act === 'remove' ? 2000 : 4000);
        this[__state] = s;
        eval('this.curtains[0].classList.' + act + '("lCurtainClose")');
        eval('this.curtains[1].classList.' + act + '("rCurtainClose")');
        this.roroIval = setTimeout(() => {
            if (cb) cb();
        }, timeout);
    }

    openCurtain(cb) {
        this.roro(__open, cb);
    }

    closeCurtain(cb) {
        this.roro(__close, cb);
    }
}
