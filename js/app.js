// ลิงก์ Cloud Storage (เช่น Firebase, AWS S3, Google Drive)
const cloudImages = [
    { url: "https://source.unsplash.com/400x400/?tattoo,1", category: "ญี่ปุ่น" },
    { url: "https://source.unsplash.com/400x400/?tattoo,2", category: "มินิมอล" },
    { url: "https://source.unsplash.com/400x400/?tattoo,3", category: "เรโทร" },
    { url: "https://source.unsplash.com/400x400/?tattoo,4", category: "ดอกไม้" },
    { url: "https://source.unsplash.com/400x400/?tattoo,5", category: "สัตว์" },
];

const gallery = document.getElementById("imageGallery");

// ฟังก์ชันโหลดภาพเริ่มต้น
function loadImages() {
    gallery.innerHTML = "";
    cloudImages.forEach((img) => {
        let imgElement = document.createElement("img");
        imgElement.src = img.url;
        imgElement.alt = img.category;
        imgElement.classList.add("gallery-item");
        gallery.appendChild(imgElement);
    });
}

// ฟังก์ชันกรองภาพตามหมวดหมู่
function filterCategory(category) {
    gallery.innerHTML = "";
    cloudImages
        .filter((img) => img.category === category)
        .forEach((img) => {
            let imgElement = document.createElement("img");
            imgElement.src = img.url;
            imgElement.alt = img.category;
            gallery.appendChild(imgElement);
        });
}

// โหลดภาพเริ่มต้น
window.onload = loadImages;
