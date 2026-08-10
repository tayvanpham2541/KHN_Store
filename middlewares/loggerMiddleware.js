function loggerMiddleware(req, res, next) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const hms = `${hours}:${minutes}:${seconds}`
    const startTime = Date.now();

    res.on("finish", () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime 
    console.log(`[${hms}] - ${req.method} ${req.url} - Status: ${res.statusCode} - ${responseTime}ms`);

    })
    return next();
};

module.exports = loggerMiddleware;