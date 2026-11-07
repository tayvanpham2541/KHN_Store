const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 phút
    max: 10, // tối đa 5 request
    message: {
        message: "Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút."
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = loginLimiter;