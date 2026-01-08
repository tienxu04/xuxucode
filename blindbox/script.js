const publishersData = {
    "Nhã Nam": ["Diệt chủng", "Tận cùng thế giới", "Người Mỹ trầm lặng", "Ocean Vuong"],
    "Phụ Nữ": ["Tối đen gần như đêm", "Kẻ trộm cà chua", "Hồi ức geisha", "Cô bé nhìn mưa"],
    "Trinh thám TQ": ["Kẻ tình nghi hoàn mỹ", "Lũng tây nổi gió", "Cái bóng trầm mặc", "Người ếch"],
    "Khác": ["Nghi can giấu mặt", "Án mạng trong tháp thủy tinh", "Chặng cuối", "Bất khuất", "Đường vinh quang"]
};
const chest = document.getElementById('main-chest');
const phase1 = document.getElementById('phase-1');
const phase2 = document.getElementById('phase-2');
const bookCardsDiv = document.getElementById('book-cards');
const publisherReveal = document.getElementById('publisher-reveal');
const modal = document.getElementById('result-modal');
const modalMessage = document.getElementById('modal-message');

// BƯỚC 1: Xử lý mở rương chọn NXB ngẫu nhiên
chest.addEventListener('click', function() {
    this.classList.add('chest-open-animation');
    
    const keys = Object.keys(publishersData);
    const randomNXB = keys[Math.floor(Math.random() * keys.length)];

    setTimeout(() => {
        phase1.classList.add('hidden');
        phase2.classList.remove('hidden');
        publisherReveal.innerHTML = `<span class="reveal-text">${randomNXB}</span>`;
        renderBooks(randomNXB);
    }, 600);
});

// BƯỚC 2: Tạo danh sách sách của NXB đó
function renderBooks(nxb) {
    bookCardsDiv.innerHTML = '';
    publishersData[nxb].forEach(title => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-front"><i class="fas fa-book"></i></div>
            <div class="book-back"><span>${title}</span></div>
        `;
        
        card.addEventListener('click', function() {
            if (!this.classList.contains('flipped')) {
                // Chỉ cho lật một cuốn duy nhất
                const allCards = document.querySelectorAll('.book-card');
                allCards.forEach(c => c.style.pointerEvents = 'none'); 
                
                this.classList.add('flipped');
                
                setTimeout(() => {
                    showFinalResult(nxb, title);
                }, 800);
            }
        });
        bookCardsDiv.appendChild(card);
    });
}

function showFinalResult(nxb, book) {
    modalMessage.innerHTML = `Bạn đã bốc trúng cuốn:<br><strong>${book}</strong><br>(Thuộc nhóm ${nxb})`;
    modal.style.display = 'flex';
}

// Đóng modal khi bấm X
document.querySelector('.close-button').onclick = () => modal.style.display = 'none';
