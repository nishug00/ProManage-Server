
const fs = require('fs');

const incomingRequestLogger = (req, res, next) => {
    fs.appendFileSync ("log.txt", req.method + " " + req.url + " " + new Date().toISOString() + "\n");
    next();
}

module.exports = {
    incomingRequestLogger
}