const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // tối đa 5 request
    message: {
        message: "Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút."
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = loginLimiter;