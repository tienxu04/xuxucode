const publishersData = {
    "Nhã Nam": ["Diệt chủng", "Tận cùng thế giới", "Người Mỹ trầm lặng", "Hội chứng E", "Ocean Vuong"],
    "Phụ Nữ": ["Tối đen gần như đêm", "Kẻ trộm cà chua", "Hồi ức geisha", "Cô bé nhìn mưa"],
    "Trinh thám TQ": ["Kẻ tình nghi hoàn mỹ", "Lũng tây nổi gió", "Cái bóng trầm mặc", "Người ếch"],
    "Khác": ["Nghi can giấu mặt", "Án mạng trong tháp thủy tinh", "Chặng cuối", "Bất khuất", "Đường vinh quang"]
};

const chest = document.getElementById('main-chest');
const phase1 = document.getElementById('phase-1');
const phase2 = document.getElementById('phase-2');
const bookCardsDiv = document.getElementById('book-cards');
const publisherReveal = document.getElementById('publisher-reveal');

// Bước 1: Mở thùng chọn NXB ngẫu nhiên
chest.addEventListener('click', function() {
    this.classList.add('chest-open-animation');
    
    // Lấy ngẫu nhiên 1 NXB
    const keys = Object.keys(publishersData);
    const randomNXB = keys[Math.floor(Math.random() * keys.length)];

    setTimeout(() => {
        phase1.classList.add('hidden');
        phase2.classList.remove('hidden');
        publisherReveal.innerHTML = `Nhà Xuất Bản: <span class="reveal-text">${randomNXB}</span>`;
        renderBooks(randomNXB);
    }, 600);
});

// Bước 2: Hiển thị sách của NXB đó
function renderBooks(nxb) {
    bookCardsDiv.innerHTML = '';
    publishersData[nxb].forEach(title => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-front"><i class="fas fa-question"></i></div>
            <div class="book-back"><p>${title}</p></div>
        `;
        card.onclick = function() {
            if(!this.classList.contains('flipped')) {
                this.classList.add('flipped');
                // Hiệu ứng ăn mừng khi lật sách
                confettiEffect();
            }
        };
        bookCardsDiv.appendChild(card);
    });
}

// Hàm pháo hoa đơn giản
function confettiEffect() {
    // Tận dụng hàm createConfetti từ code cũ của bạn hoặc thêm thư viện bên ngoài
    alert("Chúc mừng! Bạn đã bốc trúng cuốn sách này!");
}
