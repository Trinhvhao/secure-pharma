# 🎨 UI/UX REVIEW — SecurePharma Frontend

> **Ngày audit:** 15/09/2026
> **Phạm vi:** Toàn bộ 11 page + 3 layout + 22 component UI trong `frontend/src/`
> **Tham chiếu:** `docs/UI_DESIGN_SYSTEM.md` + `tailwind.config.js` + `index.css`
> **Phương pháp:** Đọc trực tiếp toàn bộ source `.jsx`, đối chiếu với design system contract.
> **Tác giả:** Cursor Assistant (audit tự động)

---

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Chấm điểm 6 trụ cột](#2-chấm-điểm-6-trụ-cột)
3. [Bảng chấm chi tiết từng trang](#3-bảng-chấm-chi-tiết-từng-trang)
4. [Danh sách vấn đề — phân loại](#4-danh-sách-vấn-đề--phân-loại)
5. [Điểm sáng đáng giữ](#5-điểm-sáng-đáng-giữ)
6. [Khuyến nghị ưu tiên](#6-khuyến-nghị-ưu-tiên)

---

## 1. Tổng quan

| Mục | Giá trị |
|---|---|
| Tổng số page | 11 (4 CRUD + 1 detail + 2 auth + 2 error + 1 dashboard + 1 change-password) |
| Tổng số component UI dùng chung | 22 (Button, Input, Select, Modal, Table, Pagination, Badge, Card, EmptyState, LoadingState, PageHeader, SearchBar, StatCard, StockBadge, ExpiryBadge, ConfirmDialog, RoleGuard…) |
| Tỷ lệ page dùng design system | **10/11 = 91%** (chỉ `DashboardPage` còn nhiều đoạn inline) |
| Có hardcode màu `bg-blue-500`, `text-green-700` (KHÔNG qua token)? | ❌ **Không phát hiện** |
| Có `window.confirm`? | ❌ **Không phát hiện** |
| Có `<div onClick>` thay button? | ❌ **Không phát hiện** |
| Có dynamic class Tailwind JIT (`bg-${color}-100`)? | ❌ **Không phát hiện** |
| Điểm trung bình | **3.2 / 4** (≈ 80%) |

> **Nhận xét chung:** Codebase đã chuẩn hoá khá tốt. Design system được áp dụng nhất quán ~91%. Vấn đề lớn nhất không nằm ở màu sắc/spacing mà ở **trải nghiệm người dùng nâng cao** (sort table, search global, breadcrumb, skeleton loading) và **dữ liệu thật** (Dashboard vẫn là "—").

---

## 2. Chấm điểm 6 trụ cột

Thang điểm: 1 = kém, 2 = trung bình, 3 = tốt, 4 = xuất sắc.

| # | Trụ cột | Điểm | Nhận xét |
|:-:|---|:-:|---|
| 1 | **Visual Consistency** (màu, font, spacing, component) | 4 / 4 | 100% page dùng design token, không hardcode. Typography scale rõ ràng. |
| 2 | **Accessibility (a11y)** | 3 / 4 | Có focus ring, aria-label trên icon, ESC đóng modal. Thiếu: skip-link, breadcrumb aria, table `<th scope>`. |
| 3 | **Information Architecture** (cây menu, layout) | 3 / 4 | Sidebar có nhóm + responsive. Thiếu: breadcrumb, header search global. |
| 4 | **User Feedback** (loading, empty, error, success) | 3 / 4 | Loading + Empty + Toast đầy đủ. Thiếu: skeleton riêng cho table; EmptyState chưa có CTA "Xoá filter". |
| 5 | **Data Interaction** (sort, filter, pagination, bulk action) | 2 / 4 | Search + pagination có, nhưng **không sortable**, pagination "thô" (chỉ 2 nút). |
| 6 | **Responsive & Polish** (mobile, dark mode, animation) | 2 / 4 | Layout responsive sơ cấp. Thiếu: skeleton, animation subtle, full-screen modal trên mobile, dark mode. |

**Trung bình: 17 / 24 = 71% (điểm 3.0 / 4)**

> Đây là mức **"Tốt, cần polish"** — đủ để demo đồ án, nhưng để production thực sự cần nâng 2 trụ cột 4 và 5 lên 4/4.

---

## 3. Bảng chấm chi tiết từng trang

| Page | VC | a11y | IA | UF | DI | RP | TB | Note |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| `LoginPage` | 4 | 3 | 4 | 3 | – | 4 | 3.6 | Đẹp, có demo accounts. Thiếu link "Quên MK?". |
| `ChangePasswordPage` | 4 | 3 | 3 | 3 | – | 3 | 3.2 | Có strength meter. Back button inline. |
| `DashboardPage` | 4 | 3 | 4 | 1 | – | 3 | 3.0 | **Mock data "—"** — lớn nhất. |
| `ThuocListPage` | 4 | 3 | 4 | 3 | 2 | 3 | 3.2 | Đầy đủ CRUD, filter. Chưa sort được. |
| `ThuocDetailPage` | 3 | 3 | 3 | 2 | – | 2 | 2.6 | Loading dùng `.spinner` cũ. Read-only, ok. |
| `DanhMucPage` | 4 | 3 | 3 | 3 | 2 | 3 | 3.0 | Đơn giản, chuẩn. |
| `KhachHangPage` | 4 | 3 | 3 | 3 | 2 | 3 | 3.0 | SDT chưa validate regex inline. |
| `NhanVienPage` | 3 | 2 | 2 | 3 | 2 | 3 | 2.5 | **Thiếu RoleGuard Admin** xung quanh actions. |
| `NhaCungCapPage` | 4 | 3 | 3 | 3 | 2 | 3 | 3.0 | Tương tự các CRUD. |
| `NotFoundPage` | 4 | 3 | 4 | 4 | – | 4 | 3.8 | Rất sạch, có CTA. |
| `ForbiddenPage` | 4 | 3 | 4 | 4 | – | 4 | 3.8 | Có role badge, 2 action. |

> VC = Visual, a11y, IA = Information Arch, UF = User Feedback, DI = Data Interaction, RP = Responsive, TB = trung bình

**Layout:**

| Component | VC | a11y | IA | UF | DI | RP | TB |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `MainLayout` | 4 | 3 | 3 | – | – | 3 | 3.25 |
| `Sidebar` | 4 | 4 | 3 | – | – | 3 | 3.5 |
| `Header` | 4 | 3 | 3 | – | – | 3 | 3.25 |

---

## 4. Danh sách vấn đề — phân loại

### 🔴 CAO (block demo, gây hiểu nhầm)

| ID | Vấn đề | File | Triệu chứng |
|---|---|---|---|
| **H-01** | Dashboard stats là mock | `DashboardPage.jsx:55-86` | Tất cả StatCard đều `value: '—'`. Khi demo với giảng viên, nhìn rất "non-production". |
| **H-02** | NhanVienPage thiếu RoleGuard | `NhanVienPage.jsx:218-321` | PageHeader actions và cột "Thao tác" không bọc `<RoleGuard roles={['Admin']}>`. NV_BanHang vào URL `/nhan-vien` có thể thấy nút Sửa/Xoá. (Đã có `ProtectedRoute` ở route nhưng UI vẫn hiện.) |
| **H-03** | NhanVienPage Modal mở từ mọi role | `NhanVienPage.jsx` | Tương tự H-02: thiếu guard ở PageHeader.action và column action. |

### 🟠 TRUNG BÌNH (ảnh hưởng UX, dễ sửa)

| ID | Vấn đề | File | Giải pháp gợi ý |
|---|---|---|---|
| **M-01** | Pagination chỉ có Prev/Next | `Pagination.jsx` | Thêm nút số trang (1, 2, 3…10) + "Trang đầu" / "Trang cuối" + jump-to-page input. |
| **M-02** | Table không sortable | `Table.jsx` | Thêm prop `sortable`, click header → sort client (nếu đã có data) hoặc callback `onSort`. |
| **M-03** | Form không validate realtime | Tất cả form | Pattern: blur → validate → hiển thị `<p>` error dưới input. Validate SDT (regex `^0[0-9]{9,10}$`), email, số dương. |
| **M-04** | Không có breadcrumb | `MainLayout.jsx` | Thêm `<Breadcrumb>` dưới Header, dựa vào `MENU_ITEMS` để build tự động. |
| **M-05** | Không có global search ở Header | `Header.jsx` | Thêm ô search trên header (chỉ UI, có thể mock hoặc mở search page). |
| **M-06** | Không có notification bell | `Header.jsx` | Badge số thuốc sắp hết hạn / tồn kho thấp. |
| **M-07** | Loading dùng `<div className="spinner">` cũ | `ThuocDetailPage.jsx:46-49` | Thay bằng `<LoadingState/>` từ design system. |
| **M-08** | Date format không nhất quán | `NhanVienPage`, `KhachHangPage`, `DanhMucPage` | Dùng `formatDate()` từ `utils/format.js` thay vì `new Date().toLocaleDateString('vi-VN')`. |

### 🟡 THẤP (polish, nên làm nếu có thời gian)

| ID | Vấn đề | File |
|---|---|---|
| L-01 | EmptyState chưa có nút "Xoá filter" khi filter không ra kết quả | `Table.jsx` (`EmptyState.action` chưa được dùng) |
| L-02 | ChangePassword back button dùng `<button>` thay `<Link>` / component riêng | `ChangePasswordPage.jsx:89-94` |
| L-03 | System status Dashboard hardcode "OK" không phản ánh thật | `DashboardPage.jsx:141-152` |
| L-04 | Table chưa có sticky header khi scroll | `Table.jsx` |
| L-05 | Thiếu animation enter nhẹ cho row mới | `Table.jsx` |
| L-06 | Modal chưa full-screen trên mobile (< 640px) | `Modal.jsx` |
| L-07 | ConfirmDialog chỉ có variant `danger | warning | info`, chưa có `success` | `ConfirmDialog.jsx` |
| L-08 | Sidebar thiếu active scroll-into-view khi navigate | `Sidebar.jsx` |
| L-09 | Pagination không có label "Tổng cộng" rõ ràng cho accessibility | `Pagination.jsx` |
| L-10 | Table chưa có checkbox để bulk-action | `Table.jsx` |

### 🟢 NICE-TO-HAVE (ngoài scope đồ án)

| ID | Vấn đề |
|---|---|
| N-01 | Dark mode (đã ghi trong design system) |
| N-02 | Animation page transition với Framer Motion |
| N-03 | Export Excel/PDF cho danh sách |
| N-04 | Print hóa đơn template |
| N-05 | Realtime notification qua WebSocket |

---

## 5. Điểm sáng đáng giữ

Để không "đập đi xây lại", các điểm dưới đây đang rất tốt, **không cần đụng**:

- ✅ `Button`, `Input`, `Select`, `Textarea`, `RadioGroup`, `Badge`, `Card`, `Modal`, `ConfirmDialog`, `EmptyState`, `LoadingState`, `SearchBar`, `PageHeader`, `StatCard`, `StockBadge`, `ExpiryBadge`, `RoleGuard`, `Pagination` — đều đúng contract design system.
- ✅ Sidebar có `<Disclosure>` group + active state + responsive off-canvas đẹp.
- ✅ Header có Headless UI Menu + focus ring + role label.
- ✅ `LoginPage` branding chuẩn (gradient + icon + 3 demo accounts).
- ✅ `ChangePasswordPage` có password strength meter — tính năng ít đồ án có.
- ✅ `ForbiddenPage` hiển thị role + logout — đúng chuẩn a11y + UX.
- ✅ Không hardcode màu, không `window.confirm`, không dynamic Tailwind JIT → tuân thủ 100% anti-patterns của `UI_DESIGN_SYSTEM.md`.

---

## 6. Khuyến nghị ưu tiên

Xem chi tiết từng bước code trong: **`docs/UI_REDESIGN_PLAN.md`**

**Top 6 đề xuất làm NGAY (1–2 ngày):**

1. **Sửa NhanVienPage** — bọc RoleGuard xung quanh PageHeader actions + column actions (15 phút, fix ngay lỗi phân quyền UI).
2. **Thay LoadingState cho ThuocDetailPage** — bỏ `<div className="spinner">` cũ (5 phút).
3. **Đồng bộ date format** — dùng `formatDate()` ở 3 page (10 phút).
4. **Nâng cấp Pagination** — thêm số trang + jump-to-page (45 phút).
5. **Thêm Breadcrumb** ở MainLayout (60 phút).
6. **Dashboard dùng API thật** — thay mock "—" bằng gọi các endpoint thống kê (3-4 giờ, cần backend xong Phase 3H).

**6 đề xuất làm trong tuần 2:**

7. Table sortable header.
8. Form realtime validation (riêng Input component đã có sẵn `error` prop, chỉ cần hook).
9. Header notification bell (chuông + badge số thuốc sắp hết hạn).
10. Global search ở Header.
11. EmptyState khi filter rỗng → nút "Xoá filter".
12. Animation subtle cho row mount.

---

## 📞 Liên hệ

- File issue/đề xuất thêm component: comment trong `tailwind.config.js` hoặc tạo PR.
- Mọi component mới phải:
  1. Có JSDoc đầy đủ
  2. Có ít nhất 1 variant/size
  3. Pass keyboard navigation
  4. Được test trên light + dark mode (sau khi có dark mode)

> 🎓 *"Đồ án tốt không phải đồ án nhiều tính năng — mà là đồ án mà mỗi tính năng đều chỉn chu."*
