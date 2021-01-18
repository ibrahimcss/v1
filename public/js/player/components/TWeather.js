// noinspection JSUnusedGlobalSymbols
class TWeather extends TCommonClass {
    constructor() {
        super("TWeather");
        this[CONTENT_]["lang"] = "en";
        this.cpList = []; // Önemli!
        this.currentDay = "";
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    cpAddComp(plComponent) {
        this.cpList.push(plComponent);
    }

    run(isAlternative,cb) {
        moment.locale(this[CONTENT_]["lang"]);
        if (this.OK(COMPONENTS_)) {
            this.setBackgroundImage();
            let that = this;
            if (that[CONTENT_][COMPONENTS_] && typeof that[CONTENT_][COMPONENTS_] === OBJECT_ && that[CONTENT_][COMPONENTS_].length > 0) {
                let cityInfo = getWeatherLocationData(that[CONTENT_].location);
                that.removeCPList();
                let _func = function (n) {
                    if (n < that[CONTENT_][COMPONENTS_].length && that[CONTENT_][COMPONENTS_][n] !== UNDEFINED_) {
                        let momentDate = moment().add(that[CONTENT_][DAY_], "days");
                        let momentIsoStr = momentDate.set({
                            hour: 0,
                            minute: 0,
                            second: 0,
                            millisecond: 0
                        }).toISOString();
                        let p = cityInfo.Days.findIndex(x => x.date == momentIsoStr);
                        if (p > -1) {
                            switch (n) {
                                case 0://day
                                    that[CONTENT_][COMPONENTS_][n][TEXT_] = momentDate.format("dddd");
                                    break;
                                case 1://min
                                    that[CONTENT_][COMPONENTS_][n][TEXT_] = `${cityInfo.Days[p][MIN_]}°`;
                                    break;
                                case 2://max
                                    that[CONTENT_][COMPONENTS_][n][TEXT_] = `${cityInfo.Days[p][MAX_]}°`;
                                    break;
                                case 3://symbol
                                    that[CONTENT_][COMPONENTS_][n][FILE_] = getWeatherSymbol(cityInfo.Days[p][SYMBOL_])
                                    break;
                            }
                        }
                        PLAYER.createComponent(that[CONTENT_][COMPONENTS_][n], that._element, (err, comp) => {
                            if (err) clog(err,"error");
                            else that.cpAddComp(comp);
                            _func(++n);
                        },true,isAlternative);
                    } else cb(false);
                }
                _func(0);
                that.currentDay = moment().format("DD/MM/YYYY");
            } else cb(true);
        } else cb(true);
    }

    tick() {
        // 250 milisaniyede bir tick gelir
        let that = this;
        if (that.currentDay != moment().format("DD/MM/YYYY")){
            that.run(that[ISALTERNATIVE_],(err) => {
                if (err) {
                    clog(`TWeather run error on tick`);
                    that[SHOW_IT_] = false;
                }
            });
        }
    }
}
