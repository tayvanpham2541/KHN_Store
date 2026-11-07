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
const imageError = document.getElementById("image-error");
const imagePreviews = document.getElementById("image-previews");
const currentImagesList = document.getElementById("current-images");
const descriptionInput = document.getElementById("description");
const nameError = document.getElementById("name-error");
const priceError = document.getElementById("price-error");
const submitButton = document.getElementById("submit-button");
const updateLoading = document.getElementById("update-loading");

//Lấy form
const editProductForm = document.getElementById("edit-product-form");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");

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
        descriptionInput.value = product.description;

        currentImages = Array.isArray(product.images) ? product.images : [];
        renderCurrentImages();

    } catch (error) {
        errorMessage.textContent = "❌ Không thể tải sản phẩm";
        errorMessage.classList.remove("hidden");
    } finally {
        loading.classList.add("hidden");
    }
}
loadProduct();

// ẢNH SẢN PHẨM
// Ảnh đang có trong DB: { id, image_url }
let currentImages = [];
// id các ảnh đã bấm xóa (chỉ thật sự xóa khi bấm "Cập nhật sản phẩm")
const removedImageIds = new Set();

function getKeptImages() {
    return currentImages.filter(image => !removedImageIds.has(image.id));
}

// Chọn thêm ảnh mới (giới hạn tính cả ảnh đang giữ lại)
const imagePicker = createImagePicker({
    input: imageInput,
    previewContainer: imagePreviews,
    errorElement: imageError,
    getReservedCount: () => getKeptImages().length,
    // Ảnh mới đầu tiên chỉ là ảnh chính khi không còn ảnh cũ nào được giữ lại
    showMainBadge: () => getKeptImages().length === 0
});

function toggleRemoveImage(image) {
    imageError.textContent = "";

    if (removedImageIds.has(image.id)) {
        // Hoàn tác: không cho vượt quá số ảnh tối đa
        if (getKeptImages().length + imagePicker.getCount() >= MAX_PRODUCT_IMAGES) {
            imageError.textContent = `Mỗi sản phẩm tối đa ${MAX_PRODUCT_IMAGES} ảnh. Hãy bỏ bớt ảnh mới trước.`;
            return;
        }
        removedImageIds.delete(image.id);
    } else {
        removedImageIds.add(image.id);
    }

    renderCurrentImages();
}

function renderCurrentImages() {
    currentImagesList.replaceChildren();

    const mainImage = getKeptImages()[0];

    currentImages.forEach((image, index) => {
        const isRemoved = removedImageIds.has(image.id);

        const card = document.createElement("div");
        card.className = "preview-item" + (isRemoved ? " marked-removed" : "");

        const img = document.createElement("img");
        img.src = image.image_url;
        img.alt = `Ảnh sản phẩm ${index + 1}`;

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "preview-remove";
        toggleButton.textContent = isRemoved ? "↺" : "×";
        toggleButton.setAttribute(
            "aria-label",
            isRemoved ? "Hoàn tác xóa ảnh" : "Xóa ảnh này"
        );
        toggleButton.addEventListener("click", () => toggleRemoveImage(image));

        card.append(img, toggleButton);

        if (isRemoved) {
            const badge = document.createElement("span");
            badge.className = "preview-badge";
            badge.textContent = "Sẽ bị xóa";
            card.appendChild(badge);
        } else if (mainImage && image.id === mainImage.id) {
            const badge = document.createElement("span");
            badge.className = "preview-badge";
            badge.textContent = "Ảnh chính";
            card.appendChild(badge);
        }

        currentImagesList.appendChild(card);
    });

    // Cập nhật lại nhãn "Ảnh chính" của ảnh mới
    imagePicker.render();
}


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
// editProductForm.addEventListener("submit", async (event) => {
//     event.preventDefault();
//     errorMessage.textContent = "";
//     errorMessage.classList.add("hidden");
//     if (!validateProduct()) {
//         return;
//     }

//     const name = nameInput.value.trim();
//     const price = Number(priceInput.value);
//     const image = imageInput.value.trim();
//     const description = descriptionInput.value.trim();

//     const productData = {
//         name,
//         price,
//         image,
//         description
//     };

//     //CALL API PUT
//     try {
//         const csrfToken = await getCsrfToken();
//         const response = await fetch(`/products/${id}`,
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-CSRF-Token": csrfToken
//                 },
//                 body: JSON.stringify(productData)
//             });

//         //Nhận kết quả lưu vào data
//         const data = await response.json()

//         //Check lỗi
//         if (!response.ok) {
//             errorMessage.textContent = data.message;
//             errorMessage.classList.remove("hidden");
//             return;
//         }
//         //Thành công
//         alert(data.message);

//         //Quay về admin
//         window.location.href = "/admin";
//     } catch (error) {
//         console.error(error);
//         errorMessage.textContent = "Không thể kết nối đến server";
//         errorMessage.classList.remove("hidden");
//     }
// });

editProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");

    if (!validateProduct()) {
        return;
    }

    imageError.textContent = "";

    // Sản phẩm phải còn ít nhất 1 ảnh (ảnh giữ lại + ảnh mới)
    if (getKeptImages().length + imagePicker.getCount() === 0) {
        imageError.textContent = "Sản phẩm phải có ít nhất 1 ảnh";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Đang cập nhật...";
    updateLoading.classList.remove("hidden");
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const description = descriptionInput.value.trim();

    // Tạo FormData
    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);

    // Danh sách ảnh cũ cần xóa
    formData.append("removeImageIds", JSON.stringify([...removedImageIds]));

    // Các ảnh mới thêm vào (nếu có)
    imagePicker.getFiles().forEach(file => {
        formData.append("images", file);
    });

    try {
        const csrfToken = await getCsrfToken();

        const response = await fetch(`/products/${id}`, {
            method: "PUT",
            headers: {
                "X-CSRF-Token": csrfToken
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
             throw new Error(data.message||"Không thể cập nhật sản phẩm")
        }

        alert(data.message);

        window.location.href = "/admin";

    } catch (error) {
        console.error(error);

        errorMessage.textContent = error.message || "Không thể kết nối đến server";
        errorMessage.classList.remove("hidden");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Cập nhật sản phẩm";
        updateLoading.classList.add("hidden");
    }
});
