// author_detail_logic.js

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra bảo mật xem Admin đã login chưa (Chặn khách vào lén)
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        alert("Thao tác bất hợp pháp! Vui lòng đăng nhập tại trang Admin.");
        window.location.href = 'admin.html';
        return;
    }

    // 2. Bóc tách ID tác giả từ thanh địa chỉ URL (Query Parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const authorId = urlParams.get('id');

    if (!authorId) {
        document.getElementById('status-message').innerText = "Lỗi: Không tìm thấy ID tác giả trên URL!";
        document.getElementById('status-message').classList.add('text-red-500');
        return;
    }

    // 3. Tiến hành kéo data tác giả và sách kèm theo
    loadFullAuthorDetail(authorId);
});

async function loadFullAuthorDetail(authorId) {
    const statusMsg = document.getElementById('status-message');
    const contentArea = document.getElementById('profile-content');

    try {
        // BƯỚC A: Lấy thông tin tác giả từ bảng `authors`
        const { data: author, error: authorError } = await _supabase
            .from('authors')
            .select('*')
            .eq('id', authorId)
            .single();

        if (authorError) throw new Error(`Không tìm thấy tác giả: ${authorError.message}`);

        // Đổ dữ liệu tác giả lên giao diện HTML
        document.getElementById('author-name').innerText = author.name;
        document.getElementById('author-id-tag').innerText = author.id;
        document.getElementById('author-bio').innerText = author.bio || 'Chưa điền thông tin giới thiệu.';
        document.getElementById('author-avatar').src = author.avatar_url || 'https://via.placeholder.com/150?text=No+Avatar';

        // BƯỚC B: Lấy danh sách sách liên quan từ bảng `books` lọc theo `author_id`
        const { data: books, error: booksError } = await _supabase
            .from('books')
            .select('*')
            .eq('author_id', authorId)
            .order('vol_number', { ascending: true }); // Sắp xếp theo tập từ nhỏ đến lớn

        if (booksError) throw booksError;

        // Cập nhật số lượng tập sách
        document.getElementById('book-count').innerText = `${books ? books.length : 0} Vol`;

        const booksGrid = document.getElementById('books-grid');
        
        if (!books || books.length === 0) {
            booksGrid.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-400 italic text-sm border border-dashed">
                    Chưa có cuốn sách nào được kết nối với tác giả này.
                </div>
            `;
        } else {
            // Render danh sách sách thành dạng Card lộng lẫy
            booksGrid.innerHTML = books.map(book => {
                return `
                    <div class="bg-white border border-gray-200 p-3 shadow-sm hover:border-black transition-all flex flex-col justify-between group">
                        <div class="aspect-[3/4] w-full overflow-hidden bg-gray-100 border border-gray-100 relative">
                            <img src="${book.cover_url}" alt="${book.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <span class="absolute top-2 left-2 bg-black text-white font-mono text-[10px] font-bold px-1.5 py-0.5 uppercase">
                                Vol.${book.vol_number}
                            </span>
                        </div>
                        
                        <div class="mt-3 space-y-1">
                            <h4 class="font-bold text-sm text-gray-800 truncate" title="${book.title}">${book.title}</h4>
                            <div class="flex items-center justify-between pt-1">
                                <span class="text-[10px] font-mono text-gray-400">Insta: ${book.instagram_embed_id}</span>
                                <a href="https://www.instagram.com/p/${book.instagram_embed_id}/" target="_blank" class="text-[10px] uppercase font-bold text-blue-500 hover:underline">
                                    Link →
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Tắt loading và mở màn hiện nội dung
        statusMsg.classList.add('hidden');
        contentArea.classList.remove('hidden');

    } catch (err) {
        statusMsg.innerText = `Lỗi tải chi tiết: ${err.message}`;
        statusMsg.classList.add('text-red-500');
    }
}
