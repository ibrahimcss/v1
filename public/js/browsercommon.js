// const clog = console.log.bind(window.console);
// const cerr = console.error.bind(window.console);
const loadedScripts = [];
let LOGTank = [];
let LOGTankProcess = false;

function includeJS(jsFileNameWithoutExtention, cb) {
    let doCB = (xv) => {
        if (cb) {
            if (xv !== 1)
                clog(`${jsFileNameWithoutExtention}.js added to body.`, "info");
            cb();
        }
    };
    if (loadedScripts.indexOf(jsFileNameWithoutExtention) === -1) {
        loadedScripts.push(jsFileNameWithoutExtention);
        let js = document.createElement("script");
        js.type = "text/javascript";
        js.src = '/js/' + jsFileNameWithoutExtention + '.js';
        js.onload = doCB;
        document.body.appendChild(js);
    } else doCB(1);
}

// noinspection JSUnusedGlobalSymbols
function ajax(url, cb) {
    let xhttp = new XMLHttpRequest;
    xhttp.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                let res = this.responseText;
                try {
                    res = JSON.parse(res);
                } catch (e) {
                    res = false;
                }
                if (cb) cb(res);
            } else {
                if (cb) cb(false);
            }
        }
    };
    xhttp.open("GET", url);
    xhttp.timeout = 5000;
    xhttp.send();
}

function getFileExtension(fn) {
    return /^.+\.([^.]+)$/.exec(fn)[1].toLowerCase();
}

function fileProp(fn) {
    return /^.+\.([^.]+)$/.exec(fn);
}

function getNewsData(s, cb) {
    if (PLAYER.news) {
        let i = PLAYER.news.findIndex(x => x.id == s);
        if (i > -1) cb(PLAYER.news[i]);
        else cb(null)
    } else cb(null)
}

function getMeetingData(s, cb) {
    if (PLAYER.meeting) {
        let i = PLAYER.meeting.findIndex(x => x.id == s);
        if (i > -1) cb(PLAYER.meeting[i]);
        else cb(null)
    } else cb(null)
}

function getFinanceData(s, cb) {
    if (PLAYER.finance && PLAYER.finance.finance) {
        let i = PLAYER.finance.finance.findIndex(x => x._id == s);
        if (i > -1) cb(PLAYER.finance.finance[i]);
        else cb(null)
    } else cb(null)
}

function getWeatherLocationData(s) {
    if (PLAYER.weather && PLAYER.weather.locations) {
        let i = PLAYER.weather.locations.findIndex(x => x.id == s);
        if (i > -1) return PLAYER.weather.locations[i];
        else return null
    } else return null
}

function getWeatherSymbol(s) {
    let i = PLAYER.weatherfiles.findIndex(x => x.id == s);
    if (i > -1) return PLAYER.weatherfiles[i].file;
    else return null
}

function getComponents(s, cb) {
    let i = PLAYER.COMPS.findIndex(x => x._element && x._element.id == s);
    if (i > -1) cb(PLAYER.COMPS[i], i);
    // else if (i == -1) {
    //     i = PLAYER.ACOMPS.findIndex(x => x._element && x._element.id == s);
    //     if (i > -1) cb(PLAYER.ACOMPS[i], i);
    // }
    else cb(null)
}

function getDateTime2Url() {
    return encodeURI(new Date().toLocaleString());
}


function clog(message, type) {
    // let message = args[0];

    switch (type) {
        case "error":
            console.log(`%c${message}`, "color:red;font-weight:bold;");
            break;
        case "warn":
            console.log(`%c${message}`, "color:purple;font-weight:bold;");
            break;
        case "success":
            console.log(`%c${message}`, "color:green;font-weight:bold;");
            break;
        case "info":
            console.log(`%c${message}`, "color:blue;font-weight:bold;");
            break;
        case "head":
            console.log(`%c${message}`, "font-size:24px;font-weight:bold;background:navy;color:white;");
            break;
        default:
            console.log(message);
            break;
    }

    document.getElementsByClassName("logs")[0].innerHTML += `<span>${message}</span>`;
    let htmlLOGS = document.getElementsByClassName("logs")[0].querySelectorAll("span");
    if (htmlLOGS.length > 500) {
        let i = 0
        do {
            document.getElementsByClassName("logs")[0].getElementsByTagName("span")[i].remove();
        } while (++i < 100);
    }


    // console.log(PLAYER);
    if (typeof message == "object") message = JSON.stringify(message);
    if (message.indexOf('%c') > -1) message = message.split('%c').pop().trim();
    let m = {cmd: "log", data: {message: message, status: type}};
    if (LOGTank.length < 1000) LOGTank.push(m);
    if (!LOGTankProcess) {
        if (typeof PLAYER !== "undefined" && PLAYER && PLAYER.isConnected()) {
            LOGTankProcess = true;
            (function f() {
                if (LOGTank.length > 0) {
                    PLAYER.sendMessage(LOGTank.shift());
                    f();
                } else LOGTankProcess = false;
            })();
        }
    }
}

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
