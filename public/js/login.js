const loginForm = document.querySelector("#login-form")
const userInput = document.getElementById("username")
const passwordInput = document.getElementById("password")
const errorMessage = document.getElementById("error-message")

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = userInput.value;
    const password = passwordInput.value;
    const logindata = {
        username,
        password
    }
    console.log(logindata);

    const response = await fetch("/login",
        {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(logindata)
        });
    //Lấy json từ reponse lưu vào biến data
    const data = await response.json()
    if (response.ok) {
        window.location.href = `/admin`;
    } else {
        errorMessage.textContent = data.message;
    }
});