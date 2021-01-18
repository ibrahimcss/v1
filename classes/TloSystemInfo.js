/**
 * Get System Information
 * 2020, Emin
 */

const hddSpace = require('hdd-space');
const network = require('network');
const os = require('os');
const osName = require('os-name');
const moment = require('moment');


module.exports = class TSystemInfo extends require('./TloConsts') {
    constructor() {
        super();
        // this.initSystem();
    }

    getSystemInformation(cb) {
        let o = {
            datetime:moment().format("DD.MM.YYYY HH:mm"),
            disk: {},
            network: {},
            path: __dirname,
            os: osName(os.platform(), os.release()),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
        };

        network.get_active_interface(function (err, obj) {
            o.network = obj;
            hddSpace(function (info) {
                o.disk = info;
                if (cb) cb(o);
            });
        });
    }
};
