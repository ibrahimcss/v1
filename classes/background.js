chrome.app.runtime.onLaunched.addListener(function () {
    console.log('page open');
    chrome.app.window.create('start.html', {
        'outerBounds': {'left': 0, 'top': 0, 'width': 3840, 'height': 1080},
        'frame': {'type': 'none'}
    });
});

