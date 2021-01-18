class TbrowserComm extends TbrowserMessageHandler {

    constructor() {
        super();
        this.sock = io();
        let THAT = this;
        this._connected = false;
        this.sock.on('connect', () => THAT.doOnConnect());
        this.sock.on('disconnect', () => THAT.doOnDisconnect());
        this.sock.on('message', (m) => THAT.doOnMessage(m));
        this.news = []
        this.finance = {
            finance: []
        }
        this.weather = {
            locations: []
        }
    }

    get connected() {
        return this.isConnected();
    }

    isConnected() {
        return this._connected;
    }

    sendMessage(m) { // To local nodeJS
        if (this._connected) {
            if (typeof m === "object")
                this.sock.send(m); // Sending qualified messages
            else if (typeof m === "string")
                this.sock.send({c: m}); // Just sending a text of command
            else clog("Format of message that sending is not correct:\n" + m,"error");
        } else clog("Player does not connected to PServer!","error");
    }


    doOnConnect() {
        clog("Connected to local server... ", "success");
        this._connected = true;
        icon_disconnect.style.display = 'none';
    }

    doOnDisconnect() {
        clog("Local server disconnected! ", "error");
        this._connected = false;
        icon_disconnect.innerText = 'L'; // local connection is lost
        icon_disconnect.style.display = 'block';
    }

    doOnMessage(m) {
        this.processTheMessage(m);
    }
}
