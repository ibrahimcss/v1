/******************/
/* document ready */

/******************/

function dReady() {
    clog("  Here we go...  ", "head");
    clog("  © 2020 by Boran Software");
    clog("  www.boranyazilim.com\n\n");
    includeJS("player/browserplayer");
}

// Mozilla, Opera, Webkit
if (document.addEventListener) {
    let serviceMenuInterval;
    document.addEventListener("DOMContentLoaded", function () {
        dReady();

        let fServiceClose = () => {
            clearInterval(serviceMenuInterval);
            serviceMenu.classList.remove('active');
        }
        let txtpassword = document.getElementsByName('txtPasword')[0];
        document.addEventListener('keydown', function (e) {
            if (e.code == "F10") {
                if (serviceMenu.classList.contains('active')) fServiceClose();
                else {
                    serviceMenu.classList.add('active');
                    txtpassword.focus();
                    serviceMenuInterval = setInterval(fServiceClose.bind(),20000);                }
                e.preventDefault();
            }
        });

        txtpassword.addEventListener('keydown', function (e) {
            if (e.code.toLowerCase() == "enter" || e.code.toLowerCase() == "numpadenter") {
                let v = txtpassword.value;
                txtpassword.value = "";
                ajax(`/checkpassw?passw=${v}`, (data) => {
                    if (data) {
                        switch (data.status) {
                            case "OK":
                                location = "/setup";
                                break;
                            case "ERROR":
                                fServiceClose();
                                break;
                        }
                    } else fServiceClose();
                });
            }
        });
    });


} else clog('Failed to found "addEventListener" OR "attachEvent" in DOCUMENT Please use CHROME BROWSER (ES6)');
