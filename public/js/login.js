const loginForm = document.querySelector("#login-form")
const userInput = document.getElementById("username")
const passwordInput = document.getElementById("password")
const errorMessage = document.getElementById("error-message")
const togglePassword = document.getElementById("toggle-password");
const submitButton = loginForm.querySelector('button[type="submit"]');

//Ẩn hiện password
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "◉" : "👁";
    togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
    );
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorMessage.textContent = "";
    //Lấy dữ liệu
    const username = userInput.value;
    const password = passwordInput.value;

    // Validation frontend
    if (!username || !password) {
        errorMessage.textContent =
            "Tên đăng nhập và mật khẩu không được để trống";
        return;
    }
    // Khóa nút chống spam click
    submitButton.disabled = true;
    submitButton.textContent = "Đang đăng nhập...";

    const logindata = {
        username,
        password
    };

    try {
        const response = await fetch("/login", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(logindata)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(
                data.message || "Đăng nhập không thành công"
            );
        }

        // Đăng nhập thành công
        window.location.href = "/admin";
    } catch (error) {
        console.error(error);
        errorMessage.textContent =
            error.message || "Không thể kết nối đến server";
    } finally {
        // Nếu đăng nhập thất bại → cho phép thử lại
        // Nếu thành công → trang đang chuyển hướng
        submitButton.disabled = false;
        submitButton.textContent = "Đăng nhập";
    }
});