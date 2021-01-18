includeJS("player/consts", function () {
    includeJS("player/TbrowserComponents", function () {
        includeJS("player/TbrowserCurtain", function () {
            includeJS("player/TbrowserPlayer", function () {
                includeJS("player/TbrowserMessageHandler", function () {
                    includeJS("player/TbrowserComm", function () {
                        PLAYER = new TbrowserComm();
                    });
                });
            });
        });

    });
});

/**
 * ********************* *
 * BU SIRAYLA AÇ EDİTÖRÜ
 * ********************* *
 * 1. browserplayer (this file)
 * 2. TbrowserComm
 * 3. TbrowserMessageHandler
 * 4. TbrowserPlayer
 * 5. TbrowserComponents
 **/
