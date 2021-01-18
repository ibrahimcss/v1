let sudo = require('sudo-js');

module.exports = class TSUDO {
    sudoIsValid = false;

    constructor() {
        let that = this;
        sudo.setPassword(process.env.SPWD);
        console.log(process.env.SPWD);
        sudo.check(function (valid) {
            that.sudoIsValid = valid;
            if (!valid) console.log('\x1b[1;31mERROR:\x1b[0m ', "Sudo authentication error.");
        });
    }

    exec(command, cb) {
        let that = this;
        if (that.sudoIsValid) {
            sudo.exec(command, function (errSudo, pid, result) {
                if (cb) cb(errSudo, pid, result)
            });
        } else {
            console.log('\x1b[1;33m%s\x1b[0m', "Sudo code could not be run.");
            if (cb) cb(true, null, null)
        }
    }

};
