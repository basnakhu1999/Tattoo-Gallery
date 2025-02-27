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
        const itemsPerPage = 100; // จำนวนรูปภาพต่อหน้า

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
                prevButton.innerText = "ก่อนหน้า";
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
                nextButton.innerText = "ถัดไป";
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
        //เปิด Lightbox
        function openLightbox(imgSrc) {
            const lightbox = document.getElementById("lightbox");
            const lightboxImg = document.getElementById("lightbox-img");
            lightbox.style.display = "block";
            lightboxImg.src = imgSrc;
        
            // แสดง Lightbox Footer
            const lightboxFooter = lightbox.querySelector(".lightbox-footer");
            lightboxFooter.style.display = "block";
        }
        
        function closeLightbox() {
            document.getElementById("lightbox").style.display = "none";
        }
        //ดาวน์โหลดรูปภาพ
        async function downloadImage() {
            const lightboxImg = document.getElementById("lightbox-img");
            const imgSrc = lightboxImg.src; // URL ของรูปภาพที่กำลังดู
        
            try {
                // ดึงข้อมูลรูปภาพจาก URL
                const response = await fetch(imgSrc);
                const blob = await response.blob(); // แปลงข้อมูลเป็น Blob
        
                // สร้างลิงก์สำหรับดาวน์โหลด
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob); // สร้าง Blob URL
                link.download = imgSrc.split("/").pop(); // ดึงชื่อไฟล์จาก URL
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
        
                // ลบ Blob URL เพื่อเคลียร์หน่วยความจำ
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error("Error downloading image:", error);
                alert("Failed to download image. Please try again.");
            }
        }
        
        function showPaymentDetails() {
            alert("Payment details will be shown here."); // แสดงรายละเอียดการชำระเงิน (ตัวอย่าง)
        }

        
        
        
        function closeLightbox() {
            document.getElementById("lightbox").style.display = "none";
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

        // ดาวน์โหลดรูปภาพและจ่ายเงิน
        function downloadImage() {
            const lightboxImg = document.getElementById("lightbox-img");
            const imgSrc = lightboxImg.src;
        
            // สร้างลิงก์สำหรับดาวน์โหลด
            const link = document.createElement("a");
            link.href = imgSrc;
            link.download = "tattoo-design.jpg"; // ตั้งชื่อไฟล์ที่ดาวน์โหลด
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function showPaymentDetails() {
            alert("Payment details will be shown here."); // แสดงรายละเอียดการชำระเงิน (ตัวอย่าง)
        }