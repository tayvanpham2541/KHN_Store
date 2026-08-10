const crypto = require("crypto");

function csrfMiddleware(req, res, next) {

    // 1. Tạo CSRF token nếu Session chưa có
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString("hex");
    }

    // 2. Những method cần kiểm tra
    const csrfMethods = ["POST", "PUT", "DELETE"];

    // 3. Chỉ kiểm tra CSRF với POST, PUT, DELETE
    if (csrfMethods.includes(req.method)) {

        if (req.path === "/login" || req.path === "/logout") {
        return next();
    }

        // Kiểm tra Origin
        const clientOrigin = req.headers.origin;
        const allowedOrigin = process.env.CORS_ORIGIN;

        if (clientOrigin !== allowedOrigin) {
            return res.status(403).json({
                message: "Origin không hợp lệ"
            });
        }

        // Kiểm tra CSRF Token
        const clientToken = req.headers["x-csrf-token"];
        const sessionToken = req.session.csrfToken;

        if (!clientToken || clientToken !== sessionToken) {
            return res.status(403).json({
                message: "CSRF token không hợp lệ"
            });
        }
    }

    // 4. Cho request đi tiếp
    return next();
}

module.exports = csrfMiddleware;