let scc = require('socketcluster-client');
let version = require('../__version');

module.exports = class TRComm extends require('./TloRIncomingMsgCmds') {
    constructor() {
        super();
        let rsVersion = -1;
        let rsUpdateVersion = -1;
        if (process.env.RS_PATH) {
            let _rsFn = `${process.env.RS_PATH}/__version.json`;
            if (this.fileExists(_rsFn)) {
                let m = require(_rsFn);
                rsVersion = m.rs232;
                rsUpdateVersion = m.update;
            }
        }
        let opt = {
            host: process.env.RMS_HOST,
            autoConnect: true,
            autoReconnect: true,
            autoReconnectOptions: {
                initialDelay: 5000,
                randomness: 5000,
                multiplier: 1.5,
                maxDelay: 30000
            },
            query: {
                dsID: process.env.dsID,
                device: "pc",
                player_version: version.player,
                player_update_version: version.update,
                rs232_version: rsVersion,
                rs232_update_version: rsUpdateVersion,
            }
        };
        this.rmSocket = scc.create(opt);
        this.rmSocket.on('error', (err) => {
            this.clog(err.message, "error");
        });
        // RMS: remote server
        this.rmSocket.on('connect', () => this.rmsConnect());
        this.rmSocket.on('disconnect', () => this.rmsDisconnect());
        this.rmSocket.on('message', (str) => this.rmsIncomingMessage(str));
    }

    rmsConnect() {
        this.clog('Remote Server connection successfull...', "success");
        this.rmsSend("ping");
        this.playerSend({c: "connectToRMS"});
    }

    rmsDisconnect() {
        this.clog('Disconnected from Remote Server!');
        this.playerSend({c: "disconnectFromRMS"});
        // this.sendRMS2Log = false;
        // this.sendRMS2ClientLog = false;
        // this.sendRMS2RSLog = false;
    }

    rmsIncomingMessage(str) {
        let incomingMessage;
        try {
            if (str && typeof str === 'string' && str.length > 0 && str.trim().substr(0, 1) === '{') {
                try {
                    incomingMessage = JSON.parse(str); // converted to json
                    if (typeof incomingMessage === "object" && incomingMessage.hasOwnProperty('cmd')) {
                        // Related function is executing from TbrowserPlayer.
                        // Functions starting with underscore in TbrowserPlayer is executing from here.
                        eval('this._' + incomingMessage.cmd + '(incomingMessage.data, () => incomingMessage = null)');
                    } else if (!incomingMessage.hasOwnProperty('rid')) {
                        this.clog(`Error in TRComm.doRMSMessage: type of incoming message is wrong: ${JSON.stringify(str)}`, "warn");
                    }
                } catch (e) {
                    this.clog(`Error in TRComm.doRMSMessage: ${JSON.stringify(str)}`, "error");
                    this.clog(JSON.stringify(e), "error");
                }
            }
        } catch (e) {
            incomingMessage = null;
            this.clog(`Error in TRComm.doRMSMessage: ${JSON.stringify(e)}`, "error");
        }
        str = null;
    }

    rmsSend(_cmd, _data) {
        this.rmSocket.send(JSON.stringify({cmd: _cmd, data: _data}));
    }

    rmsSendServerLog(_data) {
        if (this.sendRMS2Log) this.rmsSend("playerServerLOG", _data);
    }
};
