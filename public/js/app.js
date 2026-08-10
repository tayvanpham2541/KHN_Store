const productList = document.getElementById("product-list");

//Hiển thị tất cả sản phẩm
fetch("/products") //Gọi API
    //Nhận và Chuyển respose thành Json
    .then(response => response.json())
    //Sau khi hoàn thành DL được đưa vào biến data
    .then(data => {
        console.log(data);
        let html = "";
        data.forEach(product => {
            html += `
                <div class = "product-card" data-id = "${product.id}">
                    <img class = "product-image" src = "/images/${product.image}" alt="${product.name}">    
                    <div class = "product-info">
                        <h4 class = "product-name"> Tên sản phẩm: ${product.name}</h4>
                        <p  class = "product-price"> Giá: ${Number(product.price).toLocaleString("vi-VN")} VNĐ</p>
                        <p class = "product-description"> ${product.description} </p>
                        <button class = "product-detail-button"> Xem chi tiết </button>

                    </div>
                </div>
            `
        });
        productList.innerHTML = html;
    });