// noinspection JSUnusedGlobalSymbols
class TMeeting extends TCommonClass {
    constructor() {
        super("TMeeting");
        this[CONTENT_]["lang"] = "en";
        this[ROOMID_] = 0;
        this[ROOMNAME_] = null;
        this[MEETING_LIST_] = [];
        this.isHtmlLoaded = false;
        this.cpList = []; // Önemli!
        this.activeMeetingID = null;
    }

    get cpPLCount() {
        return this.cpList.length;
    }

    cpAddComp(plComponent) {
        this.cpList.push(plComponent);
    }

    beforeDestroy(cb) {
        if (cb) cb();
    }

    run(isAlternative, cb) {
        let that = this;
        that[ROOMID_] = that[CONTENT_][ROOMID_];
        getMeetingData(that[ROOMID_], (data) => {
            if (data) {
                that[MEETING_LIST_] = data.Meeting;
                that[ROOMNAME_] = data[ROOMNAME_];

                if (this.OK(COMPONENTS_)) {
                    this.setBackgroundImage();
                    if (that[CONTENT_][COMPONENTS_] && typeof that[CONTENT_][COMPONENTS_] === OBJECT_ && that[CONTENT_][COMPONENTS_].length > 0 && typeof that[MEETING_LIST_] === OBJECT_ && that[MEETING_LIST_].length > 0) {
                        that[MEETING_LIST_].forEach((item_meeting) => {
                            if (!item_meeting['canIShow']) {
                                let cond = item_meeting[MEETING_CONDITIONS_] && item_meeting[MEETING_CONDITIONS_].length > 0 ? item_meeting[MEETING_CONDITIONS_] : [];
                                item_meeting.className = "Meeting";
                                item_meeting[SHOW_IT_] = true;
                                item_meeting[CONTENT_] = {
                                    [CONDITIONS_]: cond,
                                    [EARLY_SHOW_TIME_]: that[CONTENT_][EARLY_SHOW_TIME_]
                                }
                                delete item_meeting[MEETING_CONDITIONS_];
                                item_meeting['canIShow'] = that.canIShow.bind(item_meeting);
                            }
                        });

                        if (!that.isHtmlLoaded) {
                            let _compFunc = function (n) {
                                if (n < that[CONTENT_][COMPONENTS_].length && that[CONTENT_][COMPONENTS_][n] !== UNDEFINED_) {
                                    switch (n) {
                                        case 0://baslangıc
                                        case 1://bitis
                                        case 2://toplantı adı
                                        case 3://düzenleyen
                                        case 4://salon adı
                                        case 5://katılımcılar
                                            that[CONTENT_][COMPONENTS_][n][TEXT_] = "";
                                            break;
                                        case 6://image
                                            that[CONTENT_][COMPONENTS_][n][FILE_] = "";
                                            break;
                                    }
                                    PLAYER.createComponent(that[CONTENT_][COMPONENTS_][n], that.element, (err, comp2) => {
                                        if (err) {
                                            clog(err, "error");
                                            that.cpAddComp(null);
                                        } else {
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
        });


    }

    stop() {
        this.currentTime = 0;
    }

    tick() {
        let that = this;

        if (that[MEETING_LIST_] && that[MEETING_LIST_].length > 0) {
            let fillData = (t) => {
                for (let n = 0; n < that.cpPLCount; n++) {
                    let b = "";
                    switch (n) {
                        case 0:
                            let v = t[CONTENT_][CONDITIONS_][0];
                            let bDate = moment(`${v[BEGINDATE_]} ${v[BEGINHOUR_]}`);
                            b = bDate.format(that[CONTENT_]['meetStartDateFormat']);
                            break;
                        case 1:
                            let x = t[CONTENT_][CONDITIONS_][0];
                            let eDate = moment(`${x[ENDDATE_]} ${x[ENDHOUR_]}`);
                            b = eDate.format(that[CONTENT_]['meetEndDateFormat']);
                            break;
                        case 2:
                            b = t['Meeting_Name'];
                            break;
                        case 3:
                            b = t['Organizer'];
                            break;
                        case 4:
                            b = that[ROOMNAME_];
                            break;
                        case 5:
                            b = t['Meeting_Attendees'];
                            break;
                        case 6:
                            b = t[FILENAME_];
                            break;
                    }
                    if (that.cpList[n]) {
                        if (n < 6) {
                            // that.cpList[n].element.style.opacity = "0";
                            that.cpList[n].element[INNER_TEXT_] = b;
                            setTimeout(function () {
                                that.cpList[n].autoTextSize();
                            }, 125)
                        } else if (n == 6) {
                            console.log(fdMEDIA + this._filePrepare(b));
                            that.cpList[n][SRC_] = fdMEDIA + this._filePrepare(b);
                            that.cpList[n].element.style.opacity = "1";
                        }
                    }
                }
            }

            if (PLAYER._tickCount <= 250 || PLAYER._tickCount % 10000 == 0) {//every 10 seconds
                // console.log(PLAYER._tickCount);
                let clearFields = () => {
                    for (let n = 0; n < that.cpPLCount; n++) {
                        if (that.cpList[n] && n < 6) that.cpList[n].element[INNER_TEXT_] = "";
                        else if (that.cpList[n] && n == 6) {
                            that.cpList[n].element.style.opacity = "0";
                            that.cpList[n][SRC_] = '';
                        }
                    }
                }
                let showTScene = (isShow) => {
                    if (that.cpList[7]) {
                        if (isShow) that.cpList[7].show();
                        else that.cpList[7].hide();
                    }
                }
                let m = null;
                let s = false;
                let i = 0;
                let f_i = -1//future_index
                do {
                    m = that[MEETING_LIST_][i];
                    switch (that[CONTENT_]['meetType']) {
                        case "now":
                            s = m.canIShow();
                            break;
                        case "future":
                            let v = m[CONTENT_][CONDITIONS_][0];
                            let bDate = moment(`${v[BEGINDATE_]} ${v[BEGINHOUR_]}`);
                            if (moment() < bDate && ++f_i == Number(that[CONTENT_]['meetIndex'])) s = true;
                            break;
                    }
                }
                while (!s && ++i < that[MEETING_LIST_].length);
                if (s) {
                    if (m._id != that.activeMeetingID) {
                        that.activeMeetingID = m._id;
                        showTScene(false);
                        clearFields();
                        fillData(m);
                    }
                } else {
                    clearFields();
                    showTScene(true);
                }
            }
        }
    }
}


