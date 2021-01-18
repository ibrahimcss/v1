let express = require('express');
let cp = require('child_process');
let app = express();
let http = require('http').createServer(app);
let tasklist = require('tasklist-stream');
let os = require('os');

module.exports = class TExpressApp extends require('./TloPlayer') {

    constructor() {
        super();
        this.playerIO = require('socket.io')(http);
        this.initExpressApp();
        this.initHTTP();
        this.chkChromeInterval = null
        this.isWindows = os.type().indexOf("Windows") != -1;
    }

    initExpressApp() {
        app.set('views', this.pathResolve('views'));
        app.set('view engine', 'jade');
        app.use(express.json());
        app.use(express.urlencoded({extended: false}));
        app.use(express.static(this.pathResolve('public')));
        app.use((req, res, next) => {
            res.header('Expires', '-1');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            next();
        });
        app.use((req, res) => {
                req.next();
            },
            require('../routes/main'));
    }

    initHTTP() {
        let that = this;
        http.listen(process.env.PORT, () => {
            console.clear();
            that.clog('Boran Software :: DS Player');
            that.clog('---------------------------');
            that.clog(`dsID: :${process.env.dsID}`);
            that.clog(`listening on localhost:${process.env.PORT}`);
            that.runChrome();
        });
    }

    runChrome() {
        let that = this;
        if (process.env.DEVELOPER_MODE == 0) {
            that.browserProcessKill(function () {
                cp.exec(process.env.CHROME_BIN_NAME +
                    ' --no-first-run' +
                    ' --silent-launch' +
                    ' --password-store="basic"' +
                    ' --args --user-data-dir="PlayerChromeCash_' + process.env.PORT + '" --disable-web-security' +
                    ' --allow-running-insecure-content' +
                    ' --disable-session-crashed-bubble' +
                    ' --app' +
                    ' --load-and-launch-app=' + __dirname);

                clearInterval(that.chkChromeInterval);
                that.chkChromeInterval = setInterval(function () {
                    let browserIsRun = false;
                    if (that.isWindows) {
                        try {
                            tasklist({
                                verbose: true,
                                filters: ['status eq running']
                            })
                                .on('data', function (rprocess) {
                                    if (rprocess.windowTitle && rprocess.windowTitle.indexOf(`BORAN YAZILIM PLAYER (${process.env.dsID})`) > -1) browserIsRun = true;
                                })
                                .on('end', function () {
                                    if (!browserIsRun) {
                                        clearInterval(that.chkChromeInterval);
                                        that.runChrome();
                                    }
                                })
                        } catch (e) {
                            clearInterval(that.chkChromeInterval);
                            that.runChrome();
                        }
                    } else {
                        that.ubuntuProccessList((list) => {
                            list.forEach((itemP) => {
                                if (itemP.title.indexOf(`BORAN YAZILIM PLAYER (${process.env.dsID})`) == 0) browserIsRun = true;
                            });

                            if (!browserIsRun) {
                                clearInterval(that.chkChromeInterval);
                                that.runChrome();
                            }
                        })
                    }
                }, 10000);
            })
        }
    }

    browserProcessKill(cb) {
        let that = this;
        if (that.isWindows) {
            try {
                tasklist({
                    verbose: false,
                    filters: ['status eq running']
                })
                    .on('data', function (rprocess) {
                        try {
                            if (rprocess.imageName.includes('chrome')) {
                                tasklist({
                                    verbose: true,
                                    filters: ['pid eq ' + rprocess.pid]
                                })
                                    .on('data', function (rtprocess) {
                                        // console.log(rtprocess.windowTitle);
                                        if (rtprocess.windowTitle && rtprocess.windowTitle.indexOf(`BORAN YAZILIM PLAYER`) == -1) {
                                            setTimeout(function () {
                                                cp.exec('taskkill /PID ' + rprocess.pid + ' /T /F', function () {
                                                    if (cb) cb();
                                                });
                                            }, 2000);
                                        }
                                    })
                                    .on('end', function () {
                                        if (cb) cb();
                                    })
                            }
                        } catch (e) {
                            if (cb) cb();
                        }
                    })
                    .on('end', function () {
                        if (cb) cb();
                    })
            } catch (e) {
                if (cb) cb();
            }
        } else {
            that.ubuntuProccessList(function (list) {
                list.forEach((itemP) => {
                    if (itemP.title.indexOf(`BORAN YAZILIM PLAYER`) == -1) {
                        cp.exec(`ps -p ${itemP.pid} -o comm=`, function (err, b) {
                            if (b.indexOf("terminal") == -1) cp.exec(`kill -9 ${itemP.pid}`);
                        });
                    }
                });
                if (cb) cb();
            });
        }
    }

    ubuntuProccessList(cb) {
        cp.exec('wmctrl -lp', function (err, b) {
            let pList = b.split('\n').filter(x => x != '' && x != null).map((obj) => {
                let t = obj.split(' ').filter(x => x != '' && x != null);
                let _pid = t[2];
                t.splice(0, 4);
                return {
                    pid: _pid,
                    title: t.join(' '),
                };
            });
            if (cb) cb(pList);
        });
    }

};
