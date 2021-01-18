// noinspection JSUnusedGlobalSymbols
class TFinance extends TCommonClass {
    constructor() {
        super("TFinance");
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative,cb) {
        let that = this;
        that.setBackgroundImage();
        getFinanceData(that[CONTENT_][CURRENCY_], (data) => {
            if (data) {
                if (that.OK(FORMAT_, CURRENCY_, FINANCE_TYPE_)) {
                    let a = that.FORMAT.indexOf('.');
                    let b = that.FORMAT.split('.').pop().length;
                    let v = "";
                    switch (that[CONTENT_][FINANCE_TYPE_]) {
                        case "sell":
                            v = data.Sell ? data.Sell.substr(0, a + b + 1) : "-";
                            break;
                        case "buy":
                        default:
                            v = data.Buy ? data.Buy.substr(0, a + b + 1) : "-";
                            break;
                    }
                    that[INNER_TEXT_] = v;
                    cb(v == "-" ? true :false);
                } else cb(true);
            } else cb(true);
        });
    }

}
