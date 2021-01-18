module.exports = class TAnalyze extends require('./TloFileDownloader') {
    #analyzeInProgress;
    #newsAnalyzeInProgress;
    #meetingAnalyzeInProgress;

    constructor() {
        super();
        this.theAnalyzeEnd();
        this.makeDir(this.pathResolve(this.fdMEDIAFILES));
    }

    get analyzeInProgress() {
        return this.#analyzeInProgress;
    }

    set analyzeInProgress(v) {
        this.#analyzeInProgress = v;
    }

    get newsAnalyzeInProgress() {
        return this.#newsAnalyzeInProgress;
    }

    set newsAnalyzeInProgress(v) {
        this.#newsAnalyzeInProgress = v;
    }

    get meetingAnalyzeInProgress() {
        return this.#meetingAnalyzeInProgress;
    }

    set meetingAnalyzeInProgress(v) {
        this.#meetingAnalyzeInProgress = v;
    }

    theAnalyzeBegin() {
        this.analyzeInProgress = true;
    }

    theAnalyzeEnd() {
        this.analyzeInProgress = false;
    }

    theNewsAnalyzeBegin() {
        this.newsAnalyzeInProgress = true;
    }

    theNewsAnalyzeEnd() {
        this.newsAnalyzeInProgress = false;
    }

    theMeetingAnalyzeBegin() {
        this.meetingAnalyzeInProgress = true;
    }

    theMeetingAnalyzeEnd() {
        this.meetingAnalyzeInProgress = false;
    }

    doAnalyze(data, cb) {
        if (this.analyzeInProgress) {
            this.clog('Error: Analyze in progress!');
        } else if (!data) {
            this.clog('Error: "data" cannot null!');
        } else if (typeof data !== 'object') {
            this.clog('Error: "data" is not an object!');
        } else if (!data.hasOwnProperty('scene')) {
            this.clog('Error: "components" the key could not found in "data" !')
        } else {
            this.theAnalyzeBegin();
            let that = this;
            if (typeof data.files === 'object' && data.files.length > 0) {
                this.exMachineDownDoAll_YEAH(data, (err) => {
                    if (!err) this.updateLastFTP()
                    that.theAnalyzeEnd();
                    if (cb) cb(err);
                });
            } else {
                that.theAnalyzeEnd();
                if (cb) cb(false);
            }
        }
    }


    doNewsAnalyze(scenario, data, cb) {
        let fError = () => {
            if (cb) cb(true);
        }
        if (this.newsAnalyzeInProgress) {
            this.clog('Error: News Analyze in progress!');
            fError();
        } else if (!data) {
            this.clog('Error : News Analyze "data" cannot null!');
            fError();
        } else if (typeof data !== 'object') {
            this.clog('Error: News Analyze "data" is not an object!');
            fError();
        } else if (!scenario) {
            this.clog('Error: News Analyze "scenario" cannot null!');
            fError();
        } else {
            this.theNewsAnalyzeBegin();
            let d = {
                files: [],
                ftpRepositories: scenario['ftpRepositories']
            };
            data.forEach(itemCategory => {
                itemCategory.News.forEach(itemNews => {
                    d.files.push({
                        file: `${Object.keys(d.ftpRepositories)[0]}://news/${itemNews['Filename']}`,
                        desc: itemNews['News_Name'],
                        id: itemNews._id
                    });
                });
            });
            if (typeof d.files === 'object' && d.files.length > 0) {
                this.exMachineDownDoAll_YEAH(d, (err) => {
                    if (!err) this.updateLastFTP()
                    this.theNewsAnalyzeEnd();
                    if (cb) cb(err);
                });
            } else {
                this.theNewsAnalyzeEnd();
                if (cb) cb(false);
            }
        }
    }

    doMeetingAnalyze(scenario, data, cb) {
        let fError = () => {
            if (cb) cb(true);
        }
        if (this.meetingAnalyzeInProgress) {
            this.clog('Error: Meeting Analyze in progress!');
            fError();
        } else if (!data) {
            this.clog('Error : Meeting Analyze "data" cannot null!');
            fError();
        } else if (typeof data !== 'object') {
            this.clog('Error: Meeting Analyze "data" is not an object!');
            fError();
        } else if (!scenario) {
            this.clog('Error: Meeting Analyze "scenario" cannot null!');
            fError();
        } else {
            this.theMeetingAnalyzeBegin();
            let d = {
                files: [],
                ftpRepositories: scenario['ftpRepositories']
            };
            data.forEach(itemCategory => {
                itemCategory.Meeting.forEach(itemMeeting => {
                    d.files.push({
                        file: `${Object.keys(d.ftpRepositories)[0]}://meeting/${itemMeeting['Filename']}`,
                        desc: itemMeeting['Meeting_Name'],
                        id: itemMeeting._id
                    });
                });
            });
            if (typeof d.files === 'object' && d.files.length > 0) {
                this.exMachineDownDoAll_YEAH(d, (err) => {
                    if (!err) this.updateLastFTP()
                    this.theMeetingAnalyzeEnd();
                    if (cb) cb(err);
                });
            } else {
                this.theMeetingAnalyzeEnd();
                if (cb) cb(false);
            }
        }
    }
};
