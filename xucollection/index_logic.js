// index_logic.js

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Kho chứa dữ liệu tạm để hover chạy mượt không bị delay mạng
let localAuthorsCache = [];
let localBooksCache = [];

document.addEventListener('DOMContentLoaded', () => {
    initLandingPage();
});

async function initLandingPage() {
    const menuContainer = document.getElementById('authors-menu');
    
    try {
        // 1. Tải đồng thời cả Tác giả và Sách để tối ưu request
        const [authorsRes, booksRes] = await Promise.all([
            _supabase.from('authors').select('*').order('name'),
            _supabase.from('books').select('*').order('vol_number')
        ]);

        if (authorsRes.error) throw authorsRes.error;
        if (booksRes.error) throw booksRes.error;

        localAuthorsCache = authorsRes.data;
        localBooksCache = booksRes.data;

        if (localAuthorsCache.length === 0) {
            menuContainer.innerHTML = `<p class="text-sm text-gray-400 italic">No featured authors found.</p>`;
            return;
        }

        // 2. Render cột danh sách tác giả bên trái
        menuContainer.innerHTML = localAuthorsCache.map((author, index) => {
            return `
                <div 
                    class="author-trigger border border-gray-100 hover:border-black p-4 flex items-center justify-between cursor-pointer transition-all bg-[#fafafa] hover:bg-white group"
                    onmouseenter="handleAuthorHover('${author.id}', '${author.name}')"
                    onclick="navigateToDetail('${author.id}')"
                >
                    <div class="flex items-center gap-3">
                        <img src="${author.avatar_url || 'https://via.placeholder.com/150?text=No+Avatar'}" class="w-8 h-8 rounded-full object-cover border">
                        <span class="font-semibold text-gray-800 group-hover:text-black transition-colors">${author.name}</span>
                    </div>
                    <span class="text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1 duration-200 text-xs">→</span>
                </div>
            `;
        }).join('');

        // 3. Tự động kích hoạt hiển thị sách của tác giả ĐẦU TIÊN để trang không bị trống trải lúc mới vào
        if (localAuthorsCache.length > 0) {
            handleAuthorHover(localAuthorsCache[0].id, localAuthorsCache[0].name);
        }

    } catch (err) {
        menuContainer.innerHTML = `<p class="text-sm text-red-500 font-mono">Error: ${err.message}</p>`;
    }
}

// --- LOGIC MOUSE HOVER: Đổi danh sách tác phẩm ngay lập tức ---
window.handleAuthorHover = function(authorId, authorName) {
    const grid = document.getElementById('books-preview-grid');
    document.getElementById('preview-author-name').innerText = authorName;

    // Lọc nhanh ra các cuốn sách thuộc về tác giả đang được hover từ bộ nhớ đệm
    const filteredBooks = localBooksCache.filter(book => book.author_id === authorId);

    if (filteredBooks.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex items-center justify-center text-gray-400 italic text-xs py-12 bg-white border border-dashed fade-in-active">
                No books connected to this profile yet.
            </div>
        `;
        return;
    }

    // Render danh sách ảnh sách thu nhỏ nghệ thuật bên cột phải
    grid.innerHTML = filteredBooks.map(book => {
        return `
            <div class="bg-white border border-gray-100 p-2 shadow-sm relative group/book fade-in-active">
                <div class="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                    <img src="${book.cover_url}" alt="${book.title}" class="w-full h-full object-cover">
                    <span class="absolute bottom-1 right-1 bg-black text-white font-mono text-[9px] px-1 font-bold">
                        V.${book.vol_number}
                    </span>
                </div>
                <div class="mt-2">
                    <h4 class="text-xs font-bold text-gray-800 truncate" title="${book.title}">${book.title}</h4>
                </div>
            </div>
        `;
    }).join('');
};

// --- ĐIỀU HƯỚNG SANG TRANG DETAIL ---
window.navigateToDetail = function(authorId) {
    window.location.href = `author_detail.html?id=${authorId}`;
};