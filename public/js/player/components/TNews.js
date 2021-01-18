// noinspection JSUnusedGlobalSymbols
class TNews extends TCommonClass {
    constructor() {
        super("TNews");
        this[CONTENT_]["lang"] = "en";
        this[CATEGORYID_] = 0;
        this[CATEGORYNAME_] = null;
        this[NEWS_LIST_] = [];
        this.newsCount = 0;
        this.isHtmlLoaded = false;
        this.shownTotal = 0;
        this.newsIndex = -1; // Önemli!
        this.newsduration = 0;
        this.cpList = []; // Önemli!
    }

    //"News_Conditions":[{"begindate":"2020-11-24","beginhour":"12:00:00","enddate":"2020-11-24","endhour":"18:00:00","dailyrule":"limited","dailyper":5,"ruletype":"show","days":[]}],

    get increaseIndex() {
        let c = 0;
        let setIndex = () => {
            if (++c < this[NEWS_LIST_].length) {
                if ((++this.newsIndex >= this[NEWS_LIST_].length) || (this.shownTotal >= this.newsCount)) {
                    this.newsIndex = 0;
                    this.shownTotal = 0;
                }
                if (this[NEWS_LIST_][this.newsIndex] && this[NEWS_LIST_][this.newsIndex].canIShow()) {
                    ++this.shownTotal
                } else setIndex();
            } else {
                this.newsIndex = -1;
                this.hide();
            }

        }
        setIndex();
        return this.newsIndex;
    }

    cpAddComp(plComponent) {
        this.cpList.push(plComponent);
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative, cb) {
        let that = this;
        that[CATEGORYID_] = that[CONTENT_][CATEGORYID_];

        getNewsData(that[CATEGORYID_], (data) => {
                if (data) {
                    if (that[NEWS_LIST_] && that[NEWS_LIST_].length > 0) {//haber güncellemelerinde günlük gösterim parametrelerinin sıfırlanmaması için
                        that[NEWS_LIST_].filter(x => x[CURRENT_RULE_DATE_]).forEach((item_news) => {
                            let c = data.News.findIndex(x => x._id == item_news._id);
                            if (c > -1) {
                                data.News[c][CURRENT_RULE_DATE_] = item_news[CURRENT_RULE_DATE_];
                                data.News[c][CURRENT_RULE_PER_INDEX_] = item_news[CURRENT_RULE_PER_INDEX_];
                            }
                        });
                    }

                    that[NEWS_LIST_] = data.News;
                    that[CATEGORYNAME_] = data[CATEGORYNAME_];
                    that.newsduration = that[CONTENT_]['newsduration'];
                    that.newsCount = that[CONTENT_]['count'];

                    if (this.OK(COMPONENTS_)) {
                        this.setBackgroundImage();
                        if (that[CONTENT_][COMPONENTS_] && typeof that[CONTENT_][COMPONENTS_] === OBJECT_ && that[CONTENT_][COMPONENTS_].length > 0 && typeof that[NEWS_LIST_] === OBJECT_ && that[NEWS_LIST_].length > 0) {
                            // that.removeCPList();
                            that[NEWS_LIST_].forEach((item_news) => {
                                if (!item_news['canIShow']) {
                                    let cond = item_news[NEWS_CONDITIONS_] && item_news[NEWS_CONDITIONS_].length > 0 ? item_news[NEWS_CONDITIONS_] : [];
                                    item_news.className = "News";
                                    item_news[SHOW_IT_] = true;
                                    item_news[CONTENT_] = {
                                        [CONDITIONS_]: cond
                                    }
                                    delete item_news[NEWS_CONDITIONS_];
                                    item_news['canIShow'] = that.canIShow.bind(item_news);
                                }
                            });
                            if (!that.isHtmlLoaded) {

                                let _compFunc = function (n) {
                                    if (n < that[CONTENT_][COMPONENTS_].length && that[CONTENT_][COMPONENTS_][n] !== UNDEFINED_) {
                                        switch (n) {
                                            case 0://category
                                            case 1://title
                                            case 2://content
                                                that[CONTENT_][COMPONENTS_][n][TEXT_] = "";
                                                break;
                                            case 3://image
                                                that[CONTENT_][COMPONENTS_][n][FILE_] = "";
                                                break;
                                        }
                                        PLAYER.createComponent(that[CONTENT_][COMPONENTS_][n], that.element, (err, comp2) => {
                                            if (err){
                                                clog(err, "error");
                                                that.cpAddComp(null);
                                            }
                                            else {
                                                that.cpAddComp(comp2);
                                                if (isAlternative) comp2[ISALTERNATIVE_] = true;
                                            }
                                            _compFunc(++n);
                                        }, true, isAlternative);
                                    } else {
                                        that.isHtmlLoaded = true;
                                        cb(false);
                                    }
                                }
                                _compFunc(0);
                            } else cb(false);
                        } else cb(true);
                    } else cb(true);
                } else cb(true);
            }
        )
    }

    stop() {
        this.currentTime = 0;
    }

    tick() {
        let that = this;
        if (!that['isShowing'] && (that[CURRENT_TIME_] % that.newsduration == 0 || that[CURRENT_TIME_] == tickTime)) {
            let newsItem = that[NEWS_LIST_][that.increaseIndex];
            // console.log(newsItem);
            that['isShowing'] = true;
            let d_opacity = "1";
            if (that[PIECE_OVER_] == true) {
                if (that.element.style.opacity) d_opacity = that.element.style.opacity;
                that.element.style.opacity = "0";
                that.show();
            }
            if (that.cpList[0]) {
                that.cpList[0].element.style.opacity = "0";
                that.cpList[0].element[INNER_TEXT_] = that[CATEGORYNAME_];
                that.cpList[0].autoTextSize();
            }
            if (that.cpList[1]) {
                that.cpList[1].element.style.opacity = "0";
                that.cpList[1].element[INNER_TEXT_] = newsItem[NEWS_NAME_];
                that.cpList[1].autoTextSize();
            }
            if (that.cpList[2]) {
                that.cpList[2].element.style.opacity = "0";
                that.cpList[2].element[INNER_TEXT_] = newsItem[NEWS_CONTENT_];
                that.cpList[2].autoTextSize();
            }
            if (that.cpList[3]) that.cpList[3][SRC_] = fdMEDIA + this._filePrepare(newsItem[FILENAME_]);

            if (that[PIECE_OVER_] == true) {
                that.element.style.opacity = d_opacity;
                that.hide();
                delete that[PIECE_OVER_];
            }
        } else that['isShowing'] = false;
    }

    getToEnd(cb) {
        if (this[CURRENT_TIME_] > tickTime) {
            if (!isNaN(Number(this[PIECE_]))) {
                let c = this[CURRENT_TIME_] % this.newsduration;
                if (cb) cb(this, c === 0 ? this.newsduration : c, this.newsduration);
            } else if (!isNaN(Number(this[LAPS_]))) {
                if (cb) cb(this, this.newsIndex, this.newsCount - 1);
            }
        }
    }
}


