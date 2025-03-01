const S3_BUCKET = "tattoo-gallery11";
const REGION = "ap-southeast-2"; // เปลี่ยนเป็น Region ของคุณ
const S3_URL = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/`;

        // ฟังก์ชันดึงรูปภาพจาก S3
        async function getImagesFromS3(category) {
            try {
                // สร้าง URL เพื่อดึงรายการไฟล์ในโฟลเดอร์
                const response = await fetch(`${S3_URL}?prefix=${category}/`);
                const text = await response.text();

                // แปลง XML Response เป็นรายการไฟล์
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const files = Array.from(xml.getElementsByTagName("Key"))
                    .map(node => node.textContent)
                    .filter(key => key.endsWith(".jpg") || key.endsWith(".png")); // กรองเฉพาะไฟล์รูปภาพ

                return files.map(file => `${S3_URL}${file}`);
            } catch (error) {
                console.error("Error fetching images:", error);
                return [];
            }
        }
        

        // ฟังก์ชันแสดงรูปภาพ
        async function loadImages(category) {
            const gallery = document.getElementById("imageGallery");
            gallery.innerHTML = ""; // เคลียร์รูปเดิม
        
            const images = await getImagesFromS3(category);
            images.forEach(imgUrl => {
                const imgElement = document.createElement("img");
                imgElement.dataset.src = imgUrl; // ใช้ data-src แทน src
                imgElement.alt = category + " Tattoo";
                imgElement.classList.add("lazy-load"); // เพิ่ม class lazy-load
                gallery.appendChild(imgElement);
            });
        
            // เริ่ม lazy loading
            initLazyLoading();
        }

        // ฟังก์ชันค้นหารูปภาพ
        async function searchTattoos() {
            const searchTerm = document.getElementById("searchBox").value.toLowerCase(); // รับคำค้นหา
            const gallery = document.getElementById("imageGallery");
            gallery.innerHTML = ""; // เคลียร์รูปเดิม
        
            if (searchTerm.trim() === "") {
                alert("Please enter a search term."); // แจ้งเตือนหากช่องค้นหาว่าง
                return;
            }
        
            // ดึงรูปภาพทั้งหมดจาก S3
            const images = await getAllImagesFromS3();
        
            // กรองรูปภาพที่ตรงกับคำค้นหา
            const filteredImages = images.filter(imgUrl => {
                const fileName = imgUrl.split("/").pop().toLowerCase(); // ดึงชื่อไฟล์
                return fileName.includes(searchTerm); // ตรวจสอบว่าชื่อไฟล์มีคำค้นหาหรือไม่
            });
        
            // แสดงผลการค้นหา
            if (filteredImages.length > 0) {
                filteredImages.forEach(imgUrl => {
                    const imgElement = document.createElement("img");
                    imgElement.src = imgUrl;
                    imgElement.alt = "Tattoo";
                    imgElement.classList.add("lazy-load");
                    gallery.appendChild(imgElement);
                });
            } else {
                gallery.innerHTML = "<p>No results found.</p>"; // แสดงข้อความหากไม่พบผลลัพธ์
            }
        }

        // ฟังก์ชันดึงรูปภาพทั้งหมดจาก S3 -สำหรับการค้นหา
        async function getAllImagesFromS3() {
            const S3_BUCKET = "tattoo-gallery11";
            const REGION = "ap-southeast-2";
            const S3_URL = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/`;
        
            try {
                // ดึงรายการไฟล์ทั้งหมดจาก S3
                const response = await fetch(`${S3_URL}?list-type=2`);
                const text = await response.text();
        
                // แปลง XML Response เป็นรายการไฟล์
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const files = Array.from(xml.getElementsByTagName("Key"))
                    .map(node => node.textContent)
                    .filter(key => key.endsWith(".jpg") || key.endsWith(".png")); // กรองเฉพาะไฟล์รูปภาพ
        
                return files.map(file => `${S3_URL}${file}`);
            } catch (error) {
                console.error("Error fetching images:", error);
                return [];
            }
        }



        // โหลดรูปภาพแนะนำทันทีเมื่อหน้าเว็บโหลดเสร็จ
        document.addEventListener("DOMContentLoaded", () => {
            loadImages("suggestion"); // แสดงรูปภาพแนะนำ
        });


        function initLazyLoading() {
            const lazyImages = document.querySelectorAll("img.lazy-load");
        
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src; // โหลดรูปภาพจาก AWS S3
                        img.classList.remove("lazy-load"); // ลบ class lazy-load
                        observer.unobserve(img); // หยุดสังเกต element นี้
                    }
                });
            });
        
            lazyImages.forEach(img => {
                observer.observe(img); // เริ่มสังเกตทุกรูปภาพ
            });
        }

        //////Intersection Observer API เพื่อโหลดรูปภาพเมื่อ element ปรากฏใน viewport:
        document.addEventListener("DOMContentLoaded", () => {
            const lazyImages = document.querySelectorAll("img.lazy-load");
        
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) { // ถ้า element ปรากฏใน viewport
                        const img = entry.target;
                        img.src = img.dataset.src; // โหลดรูปภาพ
                        img.classList.remove("lazy-load"); // ลบ class lazy-load
                        observer.unobserve(img); // หยุดสังเกต element นี้
                    }
                });
            });
        
            lazyImages.forEach(img => {
                observer.observe(img); // เริ่มสังเกตทุกรูปภาพ
            });
        });

        ////100รูปต่อหน้าเว็บ
        let currentPage = 1; // หน้าปัจจุบัน
        const itemsPerPage = 50; // จำนวนรูปภาพต่อหน้า

        ////แสดงรูปภาพและปุ่ม Pagination
        async function loadImages(category, page = 1) {
            const gallery = document.getElementById("imageGallery");
            gallery.innerHTML = ""; // เคลียร์รูปเดิม
        
            const images = await getImagesFromS3(category);
            const startIndex = (page - 1) * itemsPerPage; // คำนวณ index เริ่มต้น
            const endIndex = startIndex + itemsPerPage; // คำนวณ index สิ้นสุด
            const imagesToShow = images.slice(startIndex, endIndex); // ดึงรูปภาพเฉพาะส่วนที่ต้องการ
        
            imagesToShow.forEach(imgUrl => {
                const imgElement = document.createElement("img");
                imgElement.dataset.src = imgUrl;
                imgElement.alt = category + " Tattoo";
                imgElement.classList.add("lazy-load");
                gallery.appendChild(imgElement);
            });
        
            initLazyLoading(); // เริ่ม lazy loading
            renderPagination(images.length, page, category); // แสดงปุ่ม Pagination
        }

        ////แสดงปุ่ม Pagination ไปหน้า ถอยหลัง
        function renderPagination(totalItems, currentPage, category) {
            const totalPages = Math.ceil(totalItems / itemsPerPage); // คำนวณจำนวนหน้าทั้งหมด
            const paginationContainer = document.getElementById("pagination");
            paginationContainer.innerHTML = ""; // เคลียร์ Pagination เดิม
        
            // ปุ่ม "ก่อนหน้า"
            if (currentPage > 1) {
                const prevButton = document.createElement("button");
                prevButton.innerText = "Previous";
                prevButton.addEventListener("click", () => loadImages(category, currentPage - 1));
                paginationContainer.appendChild(prevButton);
            }
        
            // ปุ่มเลขหน้า
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.innerText = i;
                if (i === currentPage) pageButton.disabled = true; // ปุ่มหน้าปัจจุบันไม่สามารถคลิกได้
                pageButton.addEventListener("click", () => loadImages(category, i));
                paginationContainer.appendChild(pageButton);
            }
        
            // ปุ่ม "ถัดไป"
            if (currentPage < totalPages) {
                const nextButton = document.createElement("button");
                nextButton.innerText = "Next";
                nextButton.addEventListener("click", () => loadImages(category, currentPage + 1));
                paginationContainer.appendChild(nextButton);
            }
        }

        //ขยายรูปภาพใหญ่ขึ้น
        function initLightbox() {
            const images = document.querySelectorAll("#imageGallery img");
        
            images.forEach(img => {
                img.addEventListener("click", () => {
                    openLightbox(img.src);
                });
            });
        }


        // ฟังก์ชันเปิด Lightbox
    function openLightbox(imgSrc) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    lightbox.style.display = "flex"; // ใช้ flex เพื่อจัดให้อยู่ตรงกลาง
    lightboxImg.src = imgSrc;
}

    // ฟังก์ชันปิด Lightbox
    function closeLightbox() {
        document.getElementById('lightbox').style.display = 'none';
    }

    // ปิด Lightbox เมื่อคลิกนอกกรอบ
    document.addEventListener('click', (event) => {
        const lightbox = document.getElementById('lightbox');
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // ปิด Lightbox เมื่อกดปุ่ม ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    });



            // ฟังก์ชันดึงชื่อไฟล์จาก URL
            async function getTitleFromImageURL() {
                const lightboxImg = document.getElementById("lightbox-img");
                if (!lightboxImg || !lightboxImg.src) {
                    console.error("Image element or src not found.");
                    return null;
                }
            
                const url = lightboxImg.src; // ดึง URL จาก src ของ <img>
            
                try {
                    // ดึง HTML ของหน้าเว็บจาก URL
                    const response = await fetch(url);
                    const htmlText = await response.text();
            
                    // ใช้ DOMParser เพื่อแยก <title> จาก HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, "text/html");
                    const title = doc.querySelector("title").textContent;
            
                    // ตัดส่วนที่ไม่จำเป็นออก (เช่น ขนาดรูปภาพ)
                    const cleanTitle = title.replace(/\(.*\)$/, "").trim(); // ตัดส่วน (1024×1024) ออก
                    return cleanTitle;
                } catch (error) {
                    console.error("Error fetching title:", error);
                    return null;
                }
            }

        // ฟังก์ชันอัปเดต Title ของรูปภาพ
        async function updateImageTitle() {
            const imageTitle = document.getElementById("image-title");
        
            // ดึง title จาก URL ของรูปภาพ
            const title = await getTitleFromImageURL();
            imageTitle.textContent = title || "Image Details"; // หากไม่มี title ให้ใช้ค่า default
        }

        // เรียกใช้ฟังก์ชันอัปเดต Title เมื่อเปิด Lightbox
        function openLightbox(imgSrc) {
            const lightbox = document.getElementById("lightbox");
            const lightboxImg = document.getElementById("lightbox-img");
            lightbox.style.display = "flex"; // ใช้ flex เพื่อจัดให้อยู่ตรงกลาง
            lightboxImg.src = imgSrc;
        
            // อัปเดต Title ของรูปภาพ
            updateImageTitle();
        }
            



        //ดาวน์โหลดรูปภาพ
        async function downloadImage() {
            const lightboxImg = document.getElementById("lightbox-img");
            const imgSrc = lightboxImg.src; // ดึง URL ของรูปภาพจาก src ของ <img>
        
            if (!imgSrc || !imgSrc.startsWith('http')) {
                alert("Invalid image URL. Cannot download.");
                return;
            }
        
            try {
                // ดึงข้อมูลรูปภาพจาก URL (รองรับการ redirect และ cross-origin)
                const response = await fetch(imgSrc, {
                    method: 'GET',
                    mode: 'cors', // รองรับ CORS
                    credentials: 'omit', // ป้องกันส่ง cookies ถ้าไม่ได้ต้องการใช้
                    headers: {
                        'Accept': 'image/*' // ระบุว่าเราต้องการไฟล์รูป
                    }
                });
        
                if (!response.ok) {
                    throw new Error("Failed to fetch image.");
                }
        
                const blob = await response.blob(); // แปลงข้อมูลเป็น Blob
                const contentType = response.headers.get('content-type');
        
                // ดึงชื่อไฟล์จาก Content-Disposition หรือใช้จาก URL
                let filename = "image.png";
                const contentDisposition = response.headers.get('content-disposition');
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?(.+?)"?$/);
                    if (match) {
                        filename = match[1];
                    }
                } else {
                    filename = imgSrc.split("/").pop().split("?")[0] || "image.png";
                }
        
                // สร้างลิงก์ดาวน์โหลด
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
        
                // ล้างหน่วยความจำ
                URL.revokeObjectURL(link.href);
        
                alert("Image downloaded successfully!");
            } catch (error) {
                console.error("Error downloading image:", error);
                alert("Failed to download image. Please try again.");
            }
        }
        
        


                // ดาวน์โหลดรูปภาพและจ่ายเงิน
          
                
                function showPaymentDetails() {
                    alert("Payment details will be shown here."); // แสดงรายละเอียดการชำระเงิน (ตัวอย่าง)
                }
        

        
        
        
     
        
        // เรียกใช้ initLightbox หลังจากโหลดรูปภาพเสร็จ
        async function loadImages(category, page = 1) {
            const gallery = document.getElementById("imageGallery");
            gallery.innerHTML = ""; // เคลียร์รูปเดิม
        
            const images = await getImagesFromS3(category);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const imagesToShow = images.slice(startIndex, endIndex);
        
            imagesToShow.forEach(imgUrl => {
                const imgElement = document.createElement("img");
                imgElement.dataset.src = imgUrl;
                imgElement.alt = category + " Tattoo";
                imgElement.classList.add("lazy-load");
                gallery.appendChild(imgElement);
            });
        
            initLazyLoading(); // เริ่ม lazy loading
            initLightbox(); // เริ่ม Lightbox สำหรับรูปภาพที่โหลดมา
            renderPagination(images.length, page, category);
        }



        // ฟังก์ชันสำหรับแสดง Toast
        function showToast(message, isSuccess = true) {
            const toast = document.getElementById("toast");
            const toastMessage = document.getElementById("toast-message");
        
            // ตั้งค่าข้อความและสีพื้นหลัง
            toastMessage.textContent = message;
            toast.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336"; // สีเขียวหรือแดง
        
            // แสดง Toast
            toast.classList.add("show");
        
            // ซ่อน Toast หลังจาก 3 วินาที
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }


            // script.js
            const mobileMenu = document.getElementById('mobile-menu');
            const mainMenu = document.querySelector('.main-menu');

            mobileMenu.addEventListener('click', () => {
                mainMenu.classList.toggle('active');
            });



            