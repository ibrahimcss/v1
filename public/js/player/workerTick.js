const tickTime = 250;

setInterval(() => {
    postMessage(tickTime);
}, tickTime);
