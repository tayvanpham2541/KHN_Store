//Lấy đường dẫn hiện tại
const path = window.location.pathname;
//Tách đường dẫn
const parts = path.split("/");
//Lấy ID sản phẩm
const id = parts[parts.length - 1];

//Lấy các ô input
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const descriptionInput = document.getElementById("description");
const nameError = document.getElementById("name-error");
const priceError = document.getElementById("price-error");
//Lấy form
const editProductForm = document.getElementById("edit-product-form");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");


//GET PRODUCT
// fetch(`/products/${id}`)
//     .then(response => response.json())
//     .then(product => {
//         console.log(product);
//         // Đổ dữ liệu vào Form
//         nameInput.value = product.name;
//         priceInput.value = product.price;
//         imageInput.value = product.image;
//         descriptionInput.value = product.description;
//     });
async function loadProduct() {
    loading.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    try {
        const response = await fetch(`/products/${id}`);
        if (!response.ok) {
            throw new Error("Không tìm thấy sản phẩm");
        }
        const product = await response.json();

        nameInput.value = product.name;
        priceInput.value = product.price;
        imageInput.value = product.image;
        descriptionInput.value = product.description;
    } catch (error) {
        errorMessage.textContent = "❌ Không thể tải sản phẩm";
        errorMessage.classList.remove("hidden");
    } finally {
        loading.classList.add("hidden");
    }
}
loadProduct();

//Hiển thị lỗi
function clearInputError(input, error) {
    input.classList.remove("input-error");
    error.textContent = "";
}

nameInput.addEventListener("input", () => {
    clearInputError(nameInput, nameError);
})

priceInput.addEventListener("input", () => {
    clearInputError(priceInput, priceError);
})

function showInputError(input, error, message) {
    error.textContent = message;
    input.classList.add("input-error");
}

//Fuc check lỗi
function validateProduct() {
    // Xóa lỗi cũ VÀ Xóa trạng thái cũ
    clearInputError(nameInput, nameError);
    clearInputError(priceInput, priceError);


    const name = nameInput.value.trim();
    const price = priceInput.value.trim();

    if (!name) {
        showInputError(nameInput, nameError, "Tên sản phẩm là bắt buộc");
        return false;
    }

    if (!price) {
        showInputError(priceInput, priceError, "Giá sản phẩm là bắt buộc");
        return false;
    }

    if (isNaN(price)) {
        showInputError(priceInput, priceError, "Gía phải là 1 số");
        return false;
    }

    if (price <= 0) {
        showInputError(priceInput, priceError, "Gía phải lớn hơn 0");
        return false;
    }
    return true;
}

async function getCsrfToken() {
    const response = await fetch("/csrf-token");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Không thể lấy CSRF token");
    }
    return data.csrfToken;
}

//UPDATE PRODUCT
editProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
    if (!validateProduct()) {
        return;
    }

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const image = imageInput.value.trim();
    const description = descriptionInput.value.trim();

    const productData = {
        name,
        price,
        image,
        description
    };

    //CALL API PUT
    try {
        const csrfToken = await getCsrfToken();
        const response = await fetch(`/products/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify(productData)
            });

        //Nhận kết quả lưu vào data
        const data = await response.json()

        //Check lỗi
        if (!response.ok) {
            errorMessage.textContent = data.message;
            errorMessage.classList.remove("hidden");
            return;
        }
        //Thành công
        alert(data.message);

        //Quay về admin
        window.location.href = "/admin";
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Không thể kết nối đến server";
        errorMessage.classList.remove("hidden");
    }
});
