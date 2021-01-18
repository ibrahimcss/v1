const path = require('path');
const router = require('express').Router();
const network = require('network');
const os = require('os');
const osName = require('os-name');
const moment = require('moment');
const hddSpace = require('hdd-space');
const wifi = require('node-wifi');
const envfile = require('envfile');
const dotenv = require('dotenv');
const md5 = require('md5');
const sudo = require("../classes/TloSudo");
let T_sudo = new sudo();


function readVersion(cb) {
    let fn = PLAYER.pathResolve('__version.json');
    PLAYER.readFile(fn, (err, d) => {
        if (!err) {
            let c = JSON.parse(d);
            cb(c)
        } else cb(null)
    })
}


router.get("/", function (req, res) {
    readVersion((_version) => {
        res.render('main', {
            title: process.env.dsID,
            dsID: process.env.dsID,
            serverIP: process.env.RMS_HOST.split(":")[0],
            serverport: process.env.RMS_HOST.split(":")[1],
            release: _version
        });
    })

});

router.get("/setup", function (req, res) {
    readVersion((_version) => {
        res.render('setup', {
            title: process.env.dsID,
            dsID: process.env.dsID,
            release: _version,
        });
    });
});

router.get("/info", function (req, res) {

    function bytesToSize(bytes) {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }

    let o = {
        datetime: moment().format("HH:mm DD/MM/YYYY "),
        disk: {},
        network: {},
        path: path.resolve(process.env.rootdirname),
        os: osName(os.platform(), os.release()),
        totalmem: bytesToSize(os.totalmem()),
        freemem: bytesToSize(os.freemem()),
        usedmem: bytesToSize(os.totalmem() - os.freemem())
    };
    network.get_active_interface(function (err, obj) {
        o.network = obj;
        hddSpace(function (info) {
            // o.disk = info;
            o.disk = {
                total: {
                    free: bytesToSize(info.total.free),
                    size: bytesToSize(info.total.size),
                    used: bytesToSize(info.total.size - info.total.free)
                }
            }
            wifi.init({
                iface: null // network interface, choose a random wifi interface if set to null
            });
            wifi.getCurrentConnections((err, currentConnections) => {
                if (err) currentConnections = {};
                else currentConnections = currentConnections[0];

                readVersion((_version) => {
                    res.render('iframe/info', {
                        info: o,
                        release: _version,
                        currentconnection: currentConnections,
                    });
                });
            });
        });
    });
});

router.get("/player", function (req, res) {
    readVersion((_version) => {
        res.render('iframe/player', {
            title: process.env.dsID,
            dsID: process.env.dsID,
            envfile: dotenv.config().parsed,
            release: _version,
        });

    });
});

router.post("/player", function (req, res) {
    let errArray = [];
    let e = dotenv.config().parsed;
    if (req.body) {
        if (req.body.dsID && !isNaN(Number(req.body.dsID))) e.dsID = parseInt(req.body.dsID);
        else errArray.push({field: "dsID", message: "Must be number."});
        if (req.body['Port'] && !isNaN(Number(req.body['Port']))) e.PORT = parseInt(req.body['Port']);
        else errArray.push({field: "Port", message: "Must be number."});
        if (req.body['Width'] && !isNaN(Number(req.body['Width']))) e.WIDTH = parseInt(req.body['Width']);
        else errArray.push({field: "Width", message: "Must be number."});
        if (req.body['Height'] && !isNaN(Number(req.body['Height']))) e.HEIGHT = parseInt(req.body['Height']);
        else errArray.push({field: "Height", message: "Must be number."});
        if (req.body['X'] && !isNaN(Number(req.body['X']))) e.X = parseInt(req.body['X']);
        else errArray.push({field: "X", message: "Must be number."});
        if (req.body['Y'] && !isNaN(Number(req.body['Y']))) e.Y = parseInt(req.body['Y']);
        else errArray.push({field: "Y", message: "Must be number."});
        if (req.body['ServerAddress']) e.RMS_HOST = req.body['ServerAddress'];
        else errArray.push({field: "ServerAddress", message: "Can not be null."});
        if (req.body['ServerPort'] && !isNaN(Number(req.body['ServerPort']))) e.RMS_HOST += `:${parseInt(req.body['ServerPort'])}`;
        else errArray.push({field: "ServerPort", message: "Must be number."});
        if (req.body['Browser']) e.CHROME_BIN_NAME = `"${req.body['Browser']}"`;
        else errArray.push({field: "Browser", message: "Can not be null."});
        if (req.body['Developer'] && !isNaN(Number(req.body['Developer']))) e.DEVELOPER_MODE = `${parseInt(req.body['Developer'])}`;
        else errArray.push({field: "Developer", message: "Must be number."});
        if (req.body['PlayerAutoUpdate'] && !isNaN(Number(req.body['PlayerAutoUpdate']))) e.PLAYER_AUTO_UPDATE = `${parseInt(req.body['PlayerAutoUpdate'])}`;
        else errArray.push({field: "PlayerUpdate", message: "Must be number."});
        if (req.body['RSAutoUpdate'] && !isNaN(Number(req.body['RSAutoUpdate']))) e.RS_AUTO_UPDATE = `${parseInt(req.body['RSAutoUpdate'])}`;
        else errArray.push({field: "RSUpdate", message: "Must be number."});
    }

    PLAYER.saveText('./.env', envfile.stringify(e), function (err) {
        let strHTML = `<!DOCTYPE html><html> <head> <title>BORAN YAZILIM PLAYER (${e.dsID})</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> </head> <style>html, body{width:100%; height:100%;padding:0;margin:0;}.full{padding:0;margin:0;width:100%;height:100%;}</style> <body> <webview id="start" class="full" partition="persist:localhost_${e.PORT}" src="http://localhost:${e.PORT}"></webview> </body> </html>`;
        PLAYER.saveText(PLAYER.pathResolve(PLAYER.fdClasses + '/start.html'), strHTML, function (errHtml) {
            // console.log("errHtml : " + errHtml);
            readVersion((_version) => {
                res.render('iframe/player', {
                    formerror: errArray,
                    err: err,
                    release: _version,
                    envfile: dotenv.config().parsed,
                });
            });
        });
    });
});

router.get("/system", function (req, res) {

    let fReturn = (a, b) => {
        readVersion((_version) => {
            res.render('iframe/system', {
                title: process.env.dsID,
                dsID: process.env.dsID,
                rmshost: process.env.RMS_HOST,
                release: _version,
                rs232: a,
                rs232update: b,
            });
        });
    }

    if (process.env.RS_PATH) {
        let fn = `${process.env.RS_PATH}/__version.json`;
        PLAYER.readFile(fn, (err, d) => {
            if (!err) {
                let c = JSON.parse(d);
                fReturn(c.rs232, c.update)
            } else fReturn(-1, -1)
        })
    } else fReturn(-1, -1)

});

router.get("/network", function (req, res) {
    let fSender = (c, v) => {
        wifi.init({
            iface: null // network interface, choose a random wifi interface if set to null
        });

        wifi.getCurrentConnections((err, currentConnections) => {
            if (err) currentConnections = {};
            else currentConnections = currentConnections[0];

            wifi.scan((error, networks) => {
                if (error) networks = [];
                readVersion((_version) => {
                    res.render('iframe/network', {
                        title: process.env.dsID,
                        dsID: process.env.dsID,
                        wifilist: networks,
                        currentconnection: currentConnections,
                        release: _version,
                        allowlist: c,
                        denylist: v
                    });
                });
            });
        });
    }

    if (process.platform == "linux") {
        T_sudo.exec(["ufw", "status"], (err, pid, result) => {
            if (!err) {
                let portList = result.split('\n').filter(x => x != '' && x != null && x.indexOf("(v6)") == -1 && x.indexOf("22/tcp") == -1);
                portList.splice(0, 3);
                portList = portList.map((obj) => {
                    return obj.split(' ').filter(x => x != '' && x != null);
                });
                let allowList = [], denyList = [];
                portList.forEach(value => {
                    switch (value[1]) {
                        case "ALLOW":
                            allowList.push(value[0]);
                            break;
                        case "DENY":
                            denyList.push(value[0]);
                            break;

                    }
                });
                fSender(allowList, denyList)
            } else fSender(null, null);
        });
    } else fSender(null, null)
});

router.post("/network", function (req, res) {
    // console.log(req.body);
    if (req.body['btnAllow'] || req.body['btnDeny']) {
        let s = req.body['btnAllow'] ? "allow" : "deny";
        let p = req.body['txtPortNo'] && !isNaN(Number(req.body['txtPortNo'])) ? req.body['txtPortNo'] : -1;
        if (p != -1) {
            T_sudo.exec(["ufw", s, p], (err, pid, result) => {
                if (err) PLAYER.clog('\x1b[1;31mERROR:\x1b[0m ', `Sudo exec error! ${s}, ${p}`);
                res.redirect("/network");
            });
        }
    } else if (req.body['destroyWifi']) {
        wifi.init({
            iface: null // network interface, choose a random wifi interface if set to null
        });
        wifi.disconnect(error => {
            res.redirect("/network");
        });
    } else if (req.body['connectWifi']) {
        let s_id = req.body["drpWiFi"];
        let pasw = req.body["txtPassword"];
        wifi.connect({ssid: s_id, password: pasw}, error => {
            setTimeout(function () {
                res.redirect("/network");
            }, 1000)
        });
    } else if (req.body['setStaticIP']) {
        let ip = req.body["txtIP"];
        let subnet = req.body["txtSubnet"];
        let gateway = req.body["txtGateway"];
        let dns = req.body["txtDNS"];

    } else res.redirect("/network");
});

router.get("/checkpassw", function (req, res) {

    let fSender = (s, m) => {
        res.setHeader('Content-Type', 'application/json');
        res.send({
            "status": s,
            "message": m
        });
    }
    if (req.query.passw) {
        let reqPass = req.query.passw;
        if (md5(reqPass) == "ddfd6c9ee3589975c9a5e84c6919a0da") fSender("OK", "Password is correct.")
        else fSender("ERROR", "Password is wrong.")
    } else fSender("ERROR", "Missing parameters.")
});

module.exports = router;
