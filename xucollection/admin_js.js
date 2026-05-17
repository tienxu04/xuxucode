// admin_js.js


const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginOverlay = document.getElementById('login-overlay');
const mainDashboard = document.getElementById('main-dashboard');

// TỰ ĐỘNG CHẠY KHI VÀO TRANG: Kiểm tra xem đã đăng nhập từ trước chưa
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (session) {
        // Nếu đã có session hợp lệ, mở khóa thẳng vào dashboard luôn
        showDashboard();
    }
});

// HÀM XỬ LÝ ĐĂNG NHẬP (Gọi khi bấm nút Verify Identity)
async function handleAdminLogin() {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    if (!email || !password) {
        alert("Vui lòng điền đầy đủ thông tin xác thực!");
        return;
    }

    const loginBtn = document.querySelector('button[onclick="handleAdminLogin()"]');
    loginBtn.innerText = "VERIFYING...";
    loginBtn.disabled = true;

    // Gửi credentials lên hệ thống Supabase Auth
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Xác thực thất bại: " + error.message);
        loginBtn.innerText = "Verify Identity";
        loginBtn.disabled = false;
    } else {
        alert("Xác thực Admin thành công!");
        showDashboard();
    }
}

// Hàm mở khóa màn hình lộ diện dashboard và load data
function showDashboard() {
    loginOverlay.classList.add('hidden');
    mainDashboard.classList.remove('hidden');
    
    // Gọi các hàm tải dữ liệu cũ của bạn ở đây (nếu có)
    // e.g., loadAuthorsList();
}

// HÀM ĐĂNG XUẤT
async function handleAdminLogout() {
    await _supabase.auth.signOut();
    alert("Đã đăng xuất khỏi Studio.");
    window.location.reload(); // Ép F5 để màn hình đen khóa lại từ đầu
}

// --- CÁC HÀM CŨ CỦA BẠN (prepareNewAuthor, saveAuthor, addBook...) GIỮ NGUYÊN PHÍA DƯỚI ---
function prepareNewAuthor() {
    console.log("Prepare new author...");
}
function saveAuthor() {
    console.log("Saving author...");
}
function addBook() {
    console.log("Adding book...");
}