// author_list_logic.js

// --- CẤU HÌNH SUPABASE ---

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra bảo mật xem người dùng đã đăng nhập chưa
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (!user) {
        alert("Thao tác bất hợp pháp! Vui lòng đăng nhập tại trang Admin.");
        window.location.href = 'admin.html';
        return;
    }

    // 2. Nếu đã đăng nhập hợp lệ, tiến hành lấy danh sách tác giả
    fetchAndRenderAuthors();
});

// HÀM LẤY VÀ IN DỮ LIỆU TÁC GIẢ
async function fetchAndRenderAuthors() {
    const grid = document.getElementById('authors-grid');
    const statusMsg = document.getElementById('status-message');

    try {
        // Truy vấn bảng authors, sắp xếp theo tên từ A-Z
        const { data: authors, error } = await _supabase
            .from('authors')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Trường hợp chưa có tác giả nào trong DB
        if (!authors || authors.length === 0) {
            statusMsg.innerText = "No authors added yet. Click '+ Add New Author' to start!";
            return;
        }

        // Duyệt mảng dữ liệu và build chuỗi HTML
        grid.innerHTML = authors.map(author => {
            // Xử lý fallback ảnh avatar nếu cậu quên không kéo thả ảnh
            const avatarSrc = author.avatar_url || 'https://via.placeholder.com/150?text=No+Avatar';
            
            // Cắt ngắn bio nếu quá dài để giao diện thẻ đều nhau
            const shortBio = author.bio && author.bio.length > 90 
                ? author.bio.substring(0, 90) + '...' 
                : (author.bio || 'No introduction provided.');

            return `
                <div class="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-black transition-all flex flex-col justify-between group">
                    <div class="flex items-start gap-4">
                        <img src="${avatarSrc}" alt="${author.name}" class="w-16 h-16 rounded-full object-cover border border-gray-100 bg-gray-50">
                        
                        <div class="flex-1">
                            <h3 class="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">${author.name}</h3>
                            <p class="text-xs text-gray-400 font-mono mt-0.5">slug: ${author.slug}</p>
                            <p class="text-sm text-gray-600 mt-3 line-clamp-2">${shortBio}</p>
                        </div>
                    </div>
                    
                    <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                        <a href="author_detail.html?id=${author.id}" class="text-xs uppercase font-bold tracking-wider text-black hover:underline flex items-center gap-1">
                            View Profile & Books →
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Ẩn dòng loading và hiển thị Grid
        statusMsg.classList.add('hidden');
        grid.classList.remove('hidden');

    } catch (err) {
        statusMsg.innerText = `Error loading authors: ${err.message}`;
        statusMsg.classList.add('text-red-500');
    }
}