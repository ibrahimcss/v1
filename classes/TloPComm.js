let path = require('path');
const fs = require('fs');
const envfile = require('envfile');
const dotenv = require('dotenv');

module.exports = class TComm extends require('./TloAnalyze') {
    #playerIO;

    constructor() {
        super();
        this.playerIO = null;
        this.pSocket = {
            player: null,
            rsController: null,
            setupController: null,
        }
    }

    get playerIO() {
        return this.#playerIO;
    }

    set playerIO(v) {
        this.#playerIO = v;
        if (this.#playerIO) this.playerIO.sockets.on('connection', (s) => this.playerConnection(s));
    }

    playerConnection(s) {
        let that = this;
        if (s.handshake.query.dsID == "setup") {
            that.clog('The setup connected.');
            that.pSocket.setupController = s;
            that.pSocket.setupController.on('disconnect', () => this.setupDisconnect());
            that.pSocket.setupController.on('message', (m) => {
                try {
                    if (typeof m == 'string') m = JSON.parse(m);
                    // console.log(m);
                    switch (m.cmd) {
                        case "player_install":
                            that.setupControllerSend("Update Player started.");
                            that.updatePlayer(m.hash);
                            break;
                        case "player_update_install":
                            that.setupControllerSend("Update Player Version started.");
                            that.updatePlayerVersion(m.hash);
                            break;
                        case "rs232_install":
                            that.setupControllerSend("Update RS232 started.");
                            that.updateRS232(m.hash);
                            break;
                        case "rs232_update_install":
                            that.setupControllerSend("Update RS232 Version started.");
                            that.updateRS232Version(m.hash);
                            break;
                        case "stop_player":
                            that.pm2Control("stop",0);
                            break;
                        case "stop_rs232":
                            that.pm2Control("stop",1);
                            break
                        case "restart_player":
                            that.pm2Control("restart",0);
                            break;
                        case "restart_rs232":
                            that.pm2Control("restart",1);
                            break
                    }
                } catch (e) {
                    that.clog(`Setup message json parse error:  ${JSON.stringify(e)}`, "error")
                }
            });
        } else if (s.handshake.query.dsID == "control") {
            that.clog('The controller connected.');
            if (s.handshake.query.root) {
                let rootPath = s.handshake.query.root;
                let e = dotenv.config().parsed;
                if (!e.RS_PATH || e.RS_PATH != rootPath) {
                    that.clog(".env set RS_PATH");
                    e.RS_PATH = rootPath;
                    that.saveText(that.pathResolve(".env"), envfile.stringify(e), null);
                }
            }
            that.pSocket.rsController = s;
            that.pSocket.rsController.on('disconnect', () => this.controllerDisconnect());
            that.pSocket.rsController.on('message', (m) => {
                try {
                    if (typeof m == 'string') m = JSON.parse(m);
                    switch (m.cmd) {
                        case "rs_server":
                            if (that.sendRMS2RSLog) this.rmsSend("playerRSLOG", m.data);
                            break;
                    }
                } catch (e) {
                    that.clog(`Controller message json parse error:  ${JSON.stringify(e)}`, "error")
                }
            });
            that.sendDeviceRules();
        } else {
            that.clog('The player connected.');
            that.pSocket.player = s;
            that.pSocket.player.on('disconnect', () => this.playerDisconnect());
            that.pSocket.player.on('message', (m) => {
                switch (m.cmd) {
                    case "log":
                        if (that.sendRMS2ClientLog) this.rmsSend("playerClientLOG", m.data);
                        break;
                    case "componentsload":
                        that.componentsFilesIsLoad = true;
                        break;
                }
            });
            //browser ile bağlantı olduğunda mevcut bileşenlerin isimlerini gönderiyoruz.
            that.sendAvailableComponents();
            if (!that.intval) that.intval = setTimeout(that.waitScenario.bind(that), that.timeOfWait);
        }
    }

    playerDisconnect() {
        this.clearIntVal();
        this.clog('The player disconnected!');
    }

    controllerDisconnect() {
        this.rsController = null;
        this.clog('The controller disconnected!');
    }

    setupDisconnect() {
        this.setupController = null;
        this.clog('The setup disconnected!');
    }

    sendAvailableComponents() {
        let that = this;
        this.listDirectory(this.pathResolve(this.fdCOMPONENTS), (filenames) => {
            for (let fx in filenames) { // noinspection JSUnfilteredForInLoop
                filenames[fx] = path.parse(filenames[fx]).name;
            }
            that.playerSend({
                c: 'availableComponents',
                d: filenames
            });
        });
    }

    sendDeviceRules() {
        let that = this;
        let fn = this.pathResolve(this.fdSCENARIO, this.fdRuleFilename);
        if (that.fileExists(fn)) {
            fs.readFile(fn, 'utf8', function (err, data) {
                if (!err) {
                    let d;
                    try {
                        d = JSON.parse(data);
                        that.rsControllerSend({
                            cmd: 'deviceRule',
                            data: d
                        });

                    } catch (e) {
                        that.clog(e);
                    }
                }
            });
        }
    }

    playerSend(m) {
        if (this.pSocket.player) this.pSocket.player.send(JSON.stringify(m));
    }

    rsControllerSend(m) {
        if (this.pSocket.rsController) {
            this.pSocket.rsController.send(JSON.stringify(m));
        }
    }

    setupControllerSend(m) {
        if (this.pSocket.setupController) {
            this.pSocket.setupController.send(m);
        }
    }

};
