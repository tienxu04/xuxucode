// index_logic.js
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 1. CƠ CHẾ QUẢN LÝ THEME
// ==========================================
window.setTheme = function(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('selected-theme', themeName);
};

function initTheme() {
    const savedTheme = localStorage.getItem('selected-theme') || 'cream';
    setTheme(savedTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();      
    initShowcase();   
});

// ==========================================
// 2. LOGIC ĐÚNG NGUYÊN TÁC XUXU
// ==========================================
async function initShowcase() {
    // Kéo dữ liệu 2 bảng độc lập
    const { data: items } = await _supabase.from('items').select('*').order('created_at', { ascending: false });
    const { data: allBooks } = await _supabase.from('books').select('*');

    const zoneAuthors = document.getElementById('zone-authors');
    const zoneBooksets = document.getElementById('zone-booksets');
    const zoneCollections = document.getElementById('zone-collections');

    zoneAuthors.innerHTML = '';
    zoneBooksets.innerHTML = '';
    zoneCollections.innerHTML = '';

    if (!items || items.length === 0) return;

    items.forEach(item => {
        // Lọc ra danh sách sách của Item này
        const itemBooks = allBooks ? allBooks.filter(book => book.item_id === item.id) : [];
        
        // Lấy thông tin cuốn đầu tiên (Ảnh và Link Insta gốc)
        const hasBooks = itemBooks.length > 0;
        const bookImg = hasBooks ? itemBooks[0].image_url : item.avatar_url;
        const bookLink = hasBooks ? itemBooks[0].original_url : 'https://instagram.com/xuxudocsach';

        const itemHTML = `
            <div class="group/item py-2 border-b border-[var(--border-color)]/30 hover:border-[var(--text-main)] transition-colors cursor-pointer"
                 onmouseenter="previewImage('${bookImg}', '${bookLink}')">
                <div class="flex justify-between items-baseline">
                    <span onclick="window.location.href='item_detail.html?id=${item.id}'" class="font-bold text-base tracking-tight hover:underline group-hover/item:translate-x-1 transition-transform inline-block">
                        ${item.name}
                    </span>
                    <span class="text-[10px] font-mono uppercase opacity-40">Hover to view</span>
                </div>
            </div>
        `;

        if (item.item_type === 'author') zoneAuthors.insertAdjacentHTML('beforeend', itemHTML);
        else if (item.item_type === 'bookset') zoneBooksets.insertAdjacentHTML('beforeend', itemHTML);
        else if (item.item_type === 'collection') zoneCollections.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Mới nạp trang: Hiển thị sẵn cuốn đầu tiên của danh mục đầu tiên
    if (items.length > 0) {
        const firstItemBooks = allBooks ? allBooks.filter(book => book.item_id === items[0].id) : [];
        const defaultImg = firstItemBooks.length > 0 ? firstItemBooks[0].image_url : items[0].avatar_url;
        const defaultLink = firstItemBooks.length > 0 ? firstItemBooks[0].original_url : 'https://instagram.com/xuxudocsach';
        previewImage(defaultImg, defaultLink);
    }
}

// HÀM HOVER: ĐỔI CẢ ẢNH LẪN LINK INSTAGRAM
window.previewImage = function(imgUrl, instaLink) {
    const stageImg = document.getElementById('stage-showcase-img');
    const stageLink = document.getElementById('stage-showcase-link');
    if (!stageImg || !stageLink) return;

    // Cập nhật link Instagram cho sân khấu
    stageLink.href = instaLink || '#';

    if (!imgUrl || imgUrl === 'null' || imgUrl === 'undefined') {
        stageImg.classList.add('opacity-0');
        return;
    }

    stageImg.classList.add('opacity-0');
    setTimeout(() => {
        stageImg.src = imgUrl;
        stageImg.classList.remove('opacity-0');
    }, 150); 
};
