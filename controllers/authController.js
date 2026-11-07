const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

async function login(req, res, next) {
    try {
        //Lấy dữ liẹu
        const { username, password } = req.body;

        if (!username || !password) {
            const error = new Error("Tên đăng nhập và mật khẩu không được để trống");
            error.statusCode = 400;
            return next(error);
        }
        //Tìm user
        const users = await userModel.findByUsername(username);

        if (users.length === 0) {
            return res.status(401).json({
                message: "Sai tên đăng nhập hoặc mật khẩu"
            })
        }
        //Tạo biến user để chứa users đầu tiên
        const user = users[0];
        //Xác mình mật khẩu người dùng nhập và mật khẩu từ CSDL
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Sai tên đăng nhập hoặc mật khẩu"
            })
        }
        req.session.userId = user.id;

        return res.status(200).json({
            message: "Đăng nhập thành công"
        })
    } catch (error) {
        console.error(error)
        next(error);
    }
}

function logout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Lỗi server"
            })
        }
        res.status(200).json({
            message: "Đã đăng xuất"
        })
    });
}

module.exports = {
    login,
    logout
};