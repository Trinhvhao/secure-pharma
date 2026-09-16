# 🔍 CRUD Modal Audit & Improvement Plan

> **Ngày audit:** 16/09/2026
> **Phạm vi:** Toàn bộ modal/form CRUD trong `frontend/src/pages/**` và `frontend/src/components/ui/`
> **Phương pháp:** Đọc code từng page, đối chiếu với `docs/UI_DESIGN_SYSTEM.md` + `docs/UI_REVIEW.md`, anti-pattern checklist (`UI_DESIGN_SYSTEM.md` mục 10)
> **Mục tiêu:** Tìm điểm các modal "quá đơn giản" và đề xuất cải thiện cụ thể theo 6 trụ cột UX

---

## 📋 Mục lục

1. [Tóm tắt kết quả audit](#1-tóm-tắt-kết-quả-audit)
2. [Bảng điểm nhanh theo từng trang CRUD](#2-bảng-điểm-nhanh-theo-từng-trang-crud)
3. [Anti-patterns phát hiện được](#3-anti-patterns-phát-hiện-được)
4. [Kế hoạch kiểm tra (Test Plan)](#4-kế-hoạch-kiểm-tra-test-plan)
5. [Đề xuất cải thiện chi tiết](#5-đề-xuất-cải-thiện-chi-tiết)
6. [Roadmap cải thiện ưu tiên](#6-roadmap-cải-thiện-ưu-tiên)
7. [Checklist Definition of Done](#7-checklist-definition-of-done)

---

## 1. Tóm tắt kết quả audit

### 1.1. Đã có sẵn (TỐT)

✅ **Design system thống nhất** — `Modal`, `Input`, `Select`, `Button`, `ConfirmDialog`, `PageHeader`, `Table`, `Pagination`, `SearchBar`, `Badge`, `RoleGuard` đều đã chuẩn hóa.
✅ **Không có `window.confirm`** — đã chuyển hết sang `<ConfirmDialog>` (xác nhận bằng grep).
✅ **RoleGuard đã áp dụng** ở hầu hết page (riêng `NhanVienPage` còn bug — đã liệt kê trong `UI_REVIEW.md`).
✅ **Toast thông báo nhất quán** với `react-hot-toast`.
✅ **Service layer** đã chuẩn (axios instance + JSDoc đầy đủ).
✅ **Một số modal rất tốt:** `AdjustLotStockModal`, `LotDetailModal`, `ThuocDetailPage` (inline edit), `PhieuNhapCreatePage`, `PhieuChiListPage` (modal tạo + validate số dư realtime).
✅ **Nâng cấp tốt ở các page có detail:** `KhachHangPage`, `NhanVienPage`, `NhaCungCapPage` đã có **Customer/Employee/Supplier Detail Modal** với stats grid, lịch sử giao dịch — vượt chuẩn CRUD thông thường.

### 1.2. Vấn đề chính — "Modal quá đơn giản"

| Trang | Modal/Form | Vấn đề chính |
|---|---|---|
| `DanhMucPage` | Create/Edit | Form 2 field, không có ngày tạo/người tạo, không có icon trực quan |
| `ThuocListPage` | Create/Edit | Form 5 field (không có ảnh, không có SKU/Barcode, không có cảnh báo trùng tên) |
| `KhachHangPage` | Create/Edit | Form 3 field (thiếu email, ngày sinh, địa chỉ) |
| `NhanVienPage` | Create/Edit | Form 6 field (thiếu email, địa chỉ, mã số thuế, CCCD, ngày ký HĐ) |
| `NhaCungCapPage` | Create/Edit | Form 3 field (thiếu email, MST, người liên hệ, website) |
| `HoaDonListPage` | Xem chi tiết | Không có nút in/xuất PDF, không có nút refund nhanh |
| `PhieuNhapListPage` | Xem chi tiết | Không có nút in phiếu, không hiển thị lịch sử chỉnh sửa |
| `PhieuChiListPage` | Create | Form 2 field (thiếu chọn NCC, file đính kèm, phân loại chi phí) |
| `SapHetHangPage` / `SapHetHanPage` | (View only) | Không có bulk action (nhập gấp nhiều thuốc cùng lúc), không có export CSV |

### 1.3. Vấn đề nhỏ phân tán (nhưng tích lũy)

| Vấn đề | Số trang bị ảnh hưởng | Mức độ |
|---|---|---|
| Hardcode `bg-info-600 hover:bg-info-50`, `bg-danger-600 hover:bg-danger-50` cho nút Sửa/Xóa (raw `<button>`) | 8 trang | 🟡 Trung bình |
| Dùng `new Date().toLocaleDateString('vi-VN')` thay vì `formatDate()` từ utils | 5 trang (đã ghi nhận trong `UI_REVIEW.md`) | 🟢 Nhỏ |
| Lỗi logic validation: cho submit form khi vẫn còn field required trống (phụ thuộc `formError` chung) | 4 trang | 🟡 Trung bình |
| Không có **dirty check** (cảnh báo khi đóng modal có thay đổi chưa lưu) | Tất cả modal | 🟡 Trung bình |
| Không có **keyboard shortcuts** (Enter submit, Esc đã có qua Headless UI) | Tất cả modal | 🟢 Nhỏ |
| Không có **inline validation** (chỉ validate khi submit → UX kém) | 4/5 modal chính | 🔴 Lớn |
| Không có **optimistic update** cho action nhanh (toggle, +/-) | `BanHangPage` | 🟢 Nhỏ |
| Spinner loading inline trong modal không đồng nhất | 3 trang | 🟢 Nhỏ |
| `formData.giaBanThamKhao` là string, ép kiểu `Number()` nhiều chỗ → dễ bug `NaN` | `ThuocListPage`, `ThuocDetailPage` | 🟡 Trung bình |
| Không có **field-level error highlight** (đang dùng `formError` chung hiển thị cả alert) | 4 trang | 🟡 Trung bình |
| Modal không có **sticky footer** (khi form dài, nút Hủy/Tạo bị trôi khỏi viewport) | `PhieuNhapCreatePage` | 🟡 Trung bình |

---

## 2. Bảng điểm nhanh theo từng trang CRUD

> Điểm 1–5 (5 = tốt nhất) theo 6 trụ cột: **UX flow, Validation, Accessibility, Visual, Performance, Data integrity**

| # | Trang / Modal | UX | Val | A11y | Visual | Perf | Data | TB | Ghi chú |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| 1 | `DanhMucPage` Create/Edit | 3 | 2 | 4 | 3 | 4 | 3 | **3.2** | Quá sơ sài, thiếu icon DM, gợi ý trùng tên |
| 2 | `ThuocListPage` Create/Edit | 3 | 3 | 4 | 3 | 4 | 3 | **3.3** | Form cứng nhắc, chưa có SKU/barcode |
| 3 | `KhachHangPage` Create/Edit | 3 | 3 | 4 | 3 | 4 | 3 | **3.3** | Thiếu email/địa chỉ/ngày sinh |
| 4 | `NhanVienPage` Create/Edit | 3 | 3 | 4 | 3 | 4 | 3 | **3.3** | Thiếu email/CCCD/MST, chưa có tạo tài khoản trong modal |
| 5 | `NhaCungCapPage` Create/Edit | 3 | 3 | 4 | 3 | 4 | 3 | **3.3** | Thiếu email/MST/website/Người LH |
| 6 | `HoaDonListPage` Detail Modal | 4 | - | 4 | 4 | 4 | 4 | **4.0** | Tốt, thiếu nút In/Xuất PDF |
| 7 | `PhieuNhapListPage` Detail Modal | 4 | - | 4 | 4 | 4 | 4 | **4.0** | Tốt, thiếu nút In phiếu |
| 8 | `PhieuNhapCreatePage` Form | **5** | 5 | 4 | 5 | 4 | **5** | **4.7** | **Mẫu mực** — validate per-row, auto-fill, computed totals, helper hints |
| 9 | `PhieuChiListPage` Create Modal | 4 | 5 | 4 | 4 | 4 | 5 | **4.3** | Rất tốt, realtime validate số dư |
| 10 | `SapHetHangPage` (view) | 4 | - | 4 | 4 | 4 | 4 | **4.0** | View-only đủ dùng, thiếu bulk action |
| 11 | `SapHetHanPage` (view) | 4 | - | 4 | 4 | 4 | 4 | **4.0** | View-only đủ dùng, thiếu bulk action |
| 12 | `TonKhoPage` + `LotDetailModal` | 5 | - | 4 | **5** | 4 | 5 | **4.6** | **Xuất sắc** — drill-down + điều chỉnh + audit log |
| 13 | `AdjustLotStockModal` | **5** | **5** | 4 | 5 | 4 | **5** | **4.7** | **Mẫu mực** — validate số, lý do bắt buộc, cảnh báo rollback |
| 14 | `ThuocDetailPage` inline edit | 5 | 4 | 4 | **5** | 4 | 5 | **4.5** | Hero design đẹp, nhưng validate chưa realtime |
| 15 | `BanHangPage` (POS) | **5** | 3 | 4 | 5 | 4 | 4 | **4.2** | **Xuất sắc** cho POS, chỉ thiếu barcode scanner hook |
| 16 | `ChangePasswordPage` | 4 | 3 | 4 | 4 | 4 | 4 | **3.8** | OK, có password strength, thiếu old-password-strength check |
| 17 | `LichSuDieuChinhPage` (view) | 4 | - | 4 | 4 | 4 | 5 | **4.2** | Audit trail đầy đủ |
| 18 | `CustomerDetailModal` (in `KhachHangPage`) | **5** | - | 4 | **5** | 4 | 5 | **4.6** | Stats grid + order history + avatar |
| 19 | `EmployeeDetailModal` (in `NhanVienPage`) | **5** | - | 4 | **5** | 4 | 5 | **4.6** | Tương tự KH, có audit trail |
| 20 | `SupplierDetailModal` (in `NhaCungCapPage`) | **5** | - | 4 | **5** | 4 | 5 | **4.6** | Tương tự |

**Trung bình toàn project: 4.0/5** — đã rất tốt, chủ yếu các modal **đơn giản thiếu trường nghiệp vụ** + thiếu **realtime validation**.

---

## 3. Anti-patterns phát hiện được

> Tham chiếu: `docs/UI_DESIGN_SYSTEM.md` mục 10.

### 3.1. ❌ Raw `<button>` cho action Sửa/Xóa (8 trang)

```jsx
// ❌ SAI — lặp lại ở DanhMucPage, KhachHangPage, NhaCungCapPage,
//           NhanVienPage, HoaDonListPage, PhieuNhapListPage, BanHangPage
<button
  type="button"
  onClick={() => setConfirmDeleteId(it.MaKH)}
  className="p-1.5 rounded-btn text-danger-600 hover:bg-danger-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  title="Xóa"
>
  <Trash2 className="w-4 h-4" />
</button>
```

**Lý do nên dùng `<Button variant="ghost" size="sm">`:**
- Đồng nhất focus ring + hover state.
- ESLint dễ kiểm tra `aria-label` bắt buộc.
- Theme đổi → sửa 1 chỗ thay vì grep/replace 8 file.

### 3.2. ❌ `new Date(...).toLocaleDateString('vi-VN')` rải rác (5 trang)

```jsx
// ❌ Đã có sẵn formatDate() trong utils/format.js nhưng vẫn hardcode
{it.NgayVaoLam ? new Date(it.NgayVaoLam).toLocaleDateString('vi-VN') : '—'}
```

Các file bị ảnh hưởng: `BanHangPage.jsx:156`, `NhanVienPage.jsx:536`, `DanhMucPage.jsx:135`, `DashboardPage.jsx:108`, `PhieuChiListPage.jsx` (đã OK).

### 3.3. ❌ Form error tổng hợp thay vì field-level (4 trang)

```jsx
// ❌ SAI — 1 ô formError chung cho mọi field
const [formError, setFormError] = useState('');

if (!formData.tenThuoc.trim() || !formData.maDM) {
  setFormError('Vui lòng nhập tên thuốc và chọn danh mục');  // User không biết lỗi field nào
  return;
}
```

**Nên làm:**
```jsx
// ✅ field-level
const [errors, setErrors] = useState({});
setErrors({ tenThuoc: 'Tên thuốc không được để trống', maDM: 'Vui lòng chọn danh mục' });
```

### 3.4. ❌ Submit form ngay khi còn lỗi (4 trang)

```jsx
// ❌ SAI — nút Submit không disable khi form invalid
<Button variant="primary" type="submit" loading={submitting}>
  Tạo mới
</Button>

// Submit handler mới check
if (!formData.tenThuoc.trim() || !formData.maDM) { ... return; }
```

**Nên làm:** disable nút ngay khi `!isValid`, đồng thời hiển thị field invalid đỏ.

### 3.5. ❌ Không có dirty-check khi đóng modal có thay đổi

```jsx
// ❌ Đóng modal mất hết data nhập dở, không cảnh báo
<Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm thuốc">
```

### 3.6. ❌ Hardcode chuỗi role `['Admin']` rải rác

```jsx
// ❌ Rải rác ở mọi page, dễ typo
<RoleGuard roles={['Admin']}>
<RoleGuard roles={['Admin', 'NV_BanHang']}>
```

**Nên đưa vào `utils/constants.js`:**
```js
export const ROLE_GROUPS = {
  ALL_ADMIN: ['Admin'],
  WRITE_KHO: ['Admin', 'NV_Kho'],
  WRITE_BANHANG: ['Admin', 'NV_BanHang'],
  ALL_EXCEPT_KHO: ['Admin', 'NV_BanHang'],
  EVERYONE: ['Admin', 'NV_BanHang', 'NV_Kho'],
};
```

---

## 4. Kế hoạch kiểm tra (Test Plan)

### 4.1. Phương pháp kiểm tra

| Lớp | Mục tiêu | Cách test |
|---|---|---|
| **F1. Functional** | CRUD hoạt động đúng | Test thủ công: Tạo → Sửa → Xem → Xóa cho từng entity |
| **F2. Validation** | Form chặn input xấu | Test boundary: empty, max-length, số âm, ký tự đặc biệt |
| **F3. Accessibility** | Keyboard + screen reader OK | Test ESC đóng, Tab navigation, focus ring |
| **F4. Visual** | Đúng design system | Visual regression: chụp ảnh trước/sau, đối chiếu design tokens |
| **F5. Role-based** | Đúng phân quyền | Login 3 role (Admin, NV_BanHang, NV_Kho), kiểm tra nút ẩn/hiện |
| **F6. Error handling** | Lỗi backend → hiển thị user-friendly | Stop backend → thử submit, network error → toast rõ ràng |

### 4.2. Test case matrix theo trang

> Chi tiết từng test case có thể copy vào file Excel/Markdown riêng.

#### 4.2.1. `DanhMucPage` — Create/Edit/Delete

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| DM-01 | Tạo mới hợp lệ | Mã: `DM_TEST`, Tên: `Thuốc test` → Submit | Modal đóng, toast "Tạo danh mục thành công", DM xuất hiện trong table |
| DM-02 | Tạo mới thiếu Mã | Chỉ nhập Tên → Submit | Lỗi inline đỏ dưới ô Mã, nút Submit disable |
| DM-03 | Tạo mới trùng Mã | Mã: `DM001` (đã có) → Submit | Toast lỗi từ BE "Mã danh mục đã tồn tại", giữ modal mở |
| DM-04 | Tạo mới Mã có khoảng trắng | Mã: `DM 001` → Submit | Nên reject hoặc tự trim (theo rule BE) |
| DM-05 | Sửa tên | Đổi "Kháng sinh" → "Kháng sinh & kháng nấm" | Lưu thành công, badge đếm thuốc giữ nguyên |
| DM-06 | Đổi Mã khi sửa | Field Mã disable | Không cho đổi (đúng theo hint hiện tại) |
| DM-07 | Xóa DM có thuốc | Click Xóa DM có `SoThuoc > 0` | Confirm dialog cảnh báo "Còn X thuốc thuộc DM này, không thể xóa" |
| DM-08 | Xóa DM rỗng | Click Xóa DM có `SoThuoc = 0` | Confirm → Xóa thành công |
| DM-09 | ESC đóng modal | Mở modal → ESC | Modal đóng, form reset |
| DM-10 | Dirty check | Mở modal → nhập dở → click outside / ESC | Modal KHÔNG đóng ngay, confirm "Có thay đổi chưa lưu" |

#### 4.2.2. `ThuocListPage` — Create/Edit/Delete

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| T-01 | Tạo hợp lệ | Tên: `Paracetamol 500mg`, DM: `Giảm đau`, Giá: `5000` | Tạo thành công |
| T-02 | Giá âm | Giá: `-1000` | Inline error "Giá bán phải ≥ 0" |
| T-03 | Tên quá dài | Tên 401 ký tự | Cắt ở 400, không crash |
| T-04 | Không chọn DM | Submit mà chưa chọn DM | Inline error, disable submit |
| T-05 | Hoạt chất có emoji | Hoạt chất: `Paracetamol 💊` | Lưu OK (DB hỗ trợ NVARCHAR) |
| T-06 | Sửa giá | Đổi giá từ 5000 → 7000 | Lưu thành công, hiển thị giá mới |
| T-07 | Xóa thuốc có lô | Thuốc đã có lô nhập | Hiện confirm "Thuốc đang có lô tồn, không thể xóa?" (nếu BE rule) |
| T-08 | Giá thập phân | Giá: `5000.5` | Round về `5000` hoặc 2 decimal tùy rule |
| T-09 | Autocomplete DM | Mở dropdown DM | Hiển thị `Mã - Tên` để dễ chọn |
| T-10 | Bulk action | Chọn nhiều row → Xóa hàng loạt | (chưa có — đề xuất thêm) |

#### 4.2.3. `KhachHangPage` — Create/Edit/Delete + Detail Modal

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| KH-01 | Tạo KH chỉ có tên | Tên: `Nguyễn Văn A`, không SĐT/Giới tính | OK, các field optional |
| KH-02 | SĐT sai format | SĐT: `123abc` | Inline error "SĐT phải 10–11 chữ số" |
| KH-03 | Tên trùng | Tạo KH trùng tên với KH cũ | OK (không unique), hiển thị cả 2 |
| KH-04 | Xóa KH có hóa đơn | Click Xóa KH đã mua hàng | Confirm cảnh báo + (BE rule) reject |
| KH-05 | Mở Detail KH | Click row KH | Modal detail mở, hiển thị stats + lịch sử mua |
| KH-06 | Click Sửa từ Detail | Click nút "Sửa" trong detail | Đóng detail → Mở Edit modal với data pre-fill |
| KH-07 | Search với keyword tiếng Việt có dấu | Tìm "Nguyễn" | Match cả "Nguyen" không dấu? (tùy BE) |
| KH-08 | Segment filter | Filter `VIP` | Chỉ hiển thị KH VIP |
| KH-09 | Lịch sử đơn rỗng | KH mới tạo, mở detail | Hiển thị "Chưa có hóa đơn" với icon |
| KH-10 | Network error | Tắt backend → Submit | Toast "Không thể kết nối server", không crash |

#### 4.2.4. `NhanVienPage` — Create/Edit/Delete + Detail Modal

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| NV-01 | Tạo NV mới (chưa có TK) | Tên, SĐT, Giới tính, Lương → Submit | OK, NV mới có `VaiTro=null`, badge "Chưa có TK" |
| NV-02 | Ngày vào làm > hôm nay | Chọn ngày mai | Inline error "Ngày vào làm không hợp lệ" |
| NV-03 | Lương âm | Lương: `-1000000` | Inline error |
| NV-04 | Sửa NV → đổi trạng thái | Từ `Đang làm` → `Nghỉ việc` | Save OK, badge đổi màu xám |
| NV-05 | Detail NV | Click row NV | Hiển thị stats + hóa đơn đã lập |
| NV-06 | Xóa NV đã lập hóa đơn | NV có `SoHoaDon > 0` | Confirm "NV đã lập X hóa đơn, có muốn xóa?" |
| NV-07 | Filter vai trò | `Quản lý` | Chỉ hiển thị NV role Admin |
| NV-08 | Tạo nhanh NV có tài khoản | (chưa có — đề xuất thêm) | Modal nên có toggle "Tạo tài khoản ngay" |
| NV-09 | RoleGuard View | Login NV_BanHang → `/nhan-vien` | Bị 403, không thấy nút Sửa/Xóa |
| NV-10 | Click row non-Admin | Login NV_BanHang | Không có nút Sửa/Xóa trong row (RoleGuard ở column) |

#### 4.2.5. `NhaCungCapPage` — Create/Edit/Delete + Detail Modal

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| NCC-01 | Tạo NCC có địa chỉ dài | 1000 ký tự | Cắt ở maxLength |
| NCC-02 | SĐT null | Để trống | OK, optional |
| NCC-03 | Tên NCC trùng | "Cty ABC" đã có | OK (không unique rule) |
| NCC-04 | Xóa NCC có phiếu nhập | NCC có `SoPhieu > 0` | Confirm cảnh báo |
| NCC-05 | Detail NCC | Click row | Stats grid + lịch sử nhập |
| NCC-06 | Filter phân khúc | `Chiến lược` | OK |
| NCC-07 | Địa chỉ chứa ký tự đặc biệt | `Số 123, Q. Long Biên, Hà Nội` | Lưu OK, hiển thị OK |
| NCC-08 | Địa chỉ dài → truncate | Click vào cell Địa chỉ | Tooltip hiển thị đầy đủ |

#### 4.2.6. `HoaDonListPage` — Detail Modal + Cancel

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| HD-01 | Mở chi tiết HĐ | Click row | Modal detail, hiển thị bảng chi tiết thuốc |
| HD-02 | Hủy HĐ đã thanh toán | Click "Hủy" | Confirm → Toast → Modal refresh status = "Đã hủy" |
| HD-03 | Hủy HĐ đã hủy | (nút Hủy ẩn theo điều kiện) | OK |
| HD-04 | Hủy HĐ không phải Admin | Login NV_BanHang | Nút Hủy không hiển thị |
| HD-05 | In HĐ | (chưa có — đề xuất) | Nên có nút "In/Xuất PDF" |
| HD-06 | Lọc theo ngày | from=01/09 → to=15/09 | Chỉ hiển thị HĐ trong khoảng |
| HD-07 | Lọc HĐ bị hủy | (chưa có filter) | Đề xuất thêm dropdown "Tất cả/Đã thanh toán/Đã hủy" |
| HD-08 | Click row không phải Admin | OK | Vẫn xem được chi tiết |

#### 4.2.7. `PhieuNhapListPage` — Detail Modal + Cancel

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| PN-01 | Mở chi tiết phiếu nhập | Click row | Modal hiển thị info NCC + bảng các lô |
| PN-02 | Hủy phiếu | Click "Hủy phiếu nhập" | Confirm → Toast → Refresh |
| PN-03 | In phiếu nhập | (chưa có — đề xuất) | Nút "In phiếu nhập" |
| PN-04 | Xem phiếu có lô hết hạn | Lô có HSD < today | Badge "Hết hạn" trong table |
| PN-05 | Lọc theo status | (chưa có) | Đề xuất filter Đã nhập/Chờ duyệt/Đã hủy |

#### 4.2.8. `PhieuNhapCreatePage` — Form tạo phiếu

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| PN-C01 | Thêm 1 lô hợp lệ | NCC + chọn thuốc + SL + NSX + HSD + giá | Submit → Toast → Navigate về list |
| PN-C02 | Thêm nhiều lô | Click "Thêm lô" 3 lần, nhập 3 thuốc | Submit 3 lô cùng lúc → OK |
| PN-C03 | Validate per-row | Lô #2 thiếu SL | Inline error "Lô #2: số lượng nhập phải > 0", focus vào field lỗi |
| PN-C04 | HSD ≤ NSX | Chọn HSD = NSX | Inline error "HSD phải sau NSX" |
| PN-C05 | HSD hôm nay | Chọn HSD = today | Inline error "HSD phải sau hôm nay" |
| PN-C06 | Auto-fill giá nhập | Chọn thuốc | Giá nhập auto = 70% giá bán (nếu chưa nhập) |
| PN-C07 | Xóa lô giữa | Click Xóa lô #2 | Lô #2 biến mất, tổng tiền cập nhật |
| PN-C08 | Tính tổng realtime | Nhập SL x Giá | Footer hiển thị tổng SL + tổng tiền cập nhật |
| PN-C09 | Preset từ query string | URL `/kho/nhap?maThuoc=123` | Modal có sẵn 1 lô cho thuốc #123 |
| PN-C10 | Submit không có NCC | Submit khi chưa chọn NCC | Inline error "Vui lòng chọn nhà cung cấp" |

#### 4.2.9. `PhieuChiListPage` — Modal tạo + View detail

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| PC-01 | Tạo phiếu chi hợp lệ | Số tiền: 500.000, Nội dung: `Thanh toán tiền điện` | OK |
| PC-02 | Số tiền = 0 | Submit số tiền = 0 | Inline error "Số tiền phải > 0" |
| PC-03 | Số tiền > số dư | Submit lớn hơn số dư | Realtime cảnh báo "Vượt số dư X ₫", disable nút |
| PC-04 | Nội dung rỗng | Submit không có nội dung | Inline error |
| PC-05 | Nội dung quá dài | 501 ký tự | Cắt ở 500 |
| PC-06 | Xem chi tiết | Click row | Modal hiển thị thông tin đầy đủ |
| PC-07 | Filter khoảng ngày | from=01/09 → to=15/09 | Chỉ hiển thị PC trong khoảng |
| PC-08 | Mở từ TaiChinhPage | Click "Tạo phiếu chi" trên dashboard tài chính | Modal mở ngay (state từ navigate) |

#### 4.2.10. `BanHangPage` — POS

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| BH-01 | Search thuốc | Gõ "Para" | Dropdown hiển thị kết quả, highlight từ khóa |
| BH-02 | Click thêm vào giỏ | Click thuốc còn hàng | Toast "+1 Tên thuốc", item xuất hiện trong giỏ |
| BH-03 | Thuốc hết hàng | Click thuốc hết | Card disabled, không click được |
| BH-04 | Tăng/giảm SL | Click + / - | Cập nhật SL, giới hạn ≤ tồn kho |
| BH-05 | Xóa item | Click icon thùng rác | Item biến mất |
| BH-06 | Tìm KH | Gõ tên KH | Dropdown hiển thị KH, chọn → hiển thị tên + mã |
| BH-07 | Khách lẻ | Để trống KH | OK, HĐ cho khách lẻ |
| BH-08 | Giảm giá | Nhập 50.000 | Thành tiền = Tổng - Giảm giá |
| BH-09 | Tiền đưa thiếu | Nhập ít hơn thành tiền | Box "Thiếu X ₫" đỏ, nút Thanh toán disable |
| BH-10 | Tiền đưa đủ | Nhập ≥ thành tiền | Box "Tiền thừa X ₫" xanh |
| BH-11 | Thanh toán | Click "Hoàn thành" | Toast "HĐ #X tạo thành công", navigate chi tiết |
| BH-12 | Reset giỏ | Click "Xóa giỏ hàng" | Toast "Đã xóa giỏ", giỏ trống |
| BH-13 | Tabs mobile | Click tab "Giỏ hàng" | Hiển thị giỏ trên mobile |
| BH-14 | Quick picks | Khi không search | Hiển thị thuốc còn hàng |

#### 4.2.11. `LotDetailModal` + `AdjustLotStockModal`

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| LOT-01 | Mở lot detail | Click thuốc từ TonKhoPage | Modal hiển thị tổng tồn + số lô + bảng FIFO |
| LOT-02 | FIFO sort | Có 3 lô với HSD khác nhau | Lô HSD sớm nhất ở đầu |
| LOT-03 | Click "Điều chỉnh" | Click nút ở 1 lô | Mở AdjustLotStockModal cho lô đó |
| LOT-04 | Điều chỉnh SL | Nhập SL mới, lý do ≥ 3 ký tự | Submit OK, toast "Đã điều chỉnh lô #X: A → B (+/-X)" |
| LOT-05 | SL không đổi | Nhập SL = tồn hiện tại | Nút Submit disable (changed = false) |
| LOT-06 | Lý do < 3 ký tự | Nhập "ab" | Inline error |
| LOT-07 | Lý do > 500 ký tự | Nhập 501 ký tự | Cắt ở 500 |
| LOT-08 | SL âm | Nhập -10 | Inline error "SL phải ≥ 0" |
| LOT-09 | SL > 1 tỷ | Nhập 9999999999 | Inline error |
| LOT-10 | Refresh sau adjust | Sau khi OK, list cập nhật | Tồn mới hiển thị, lịch sử có bản ghi mới |
| LOT-11 | Role check | Login NV_BanHang | Nút "Điều chỉnh" ẩn |

#### 4.2.12. `ThuocDetailPage` — Inline edit

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| TD-01 | Mở trang | Click tên thuốc từ list | Hero + sections hiển thị đầy đủ |
| TD-02 | Click "Chỉnh sửa" | (chỉ Admin) | Form fields enabled |
| TD-03 | Sửa tên → lưu | Đổi tên → Lưu | Toast "Đã lưu thay đổi", hero cập nhật |
| TD-04 | Đổi DM rỗng | Submit khi DM = '' | Inline error |
| TD-05 | Đổi giá âm | Submit giá = -1000 | Inline error |
| TD-06 | Cancel | Click Hủy | Form reset về giá trị gốc |
| TD-07 | Lợi nhuận ước tính | Sau khi load | Hiển thị "Lợi nhuận/đơn vị = X (+Y%)" |
| TD-08 | Lô FIFO | Bảng lô | Sắp theo HSD tăng dần |
| TD-09 | Banner quyền | Non-admin | Banner "Bạn chỉ xem, không sửa được" |
| TD-10 | Network error | Tắt backend → Save | Toast error, giữ edit mode |

### 4.3. Test accessibility chung (cross-page)

| # | Test case | Bước | Kết quả mong đợi |
|---|---|---|---|
| A11Y-01 | Tab navigation | Mở modal → bấm Tab 5 lần | Focus đi qua đúng thứ tự label → input → nút |
| A11Y-02 | ESC đóng modal | Mở modal → ESC | Modal đóng, focus trả về trigger |
| A11Y-03 | Focus ring | Tab vào input/button | Có viền focus rõ (primary-500 ring) |
| A11Y-04 | aria-label | Icon button | Có `aria-label` mô tả action |
| A11Y-05 | Color contrast | Dùng DevTools check | Text ≥ 4.5:1, Large text ≥ 3:1 |
| A11Y-06 | Screen reader | Dùng NVDA/VoiceOver | Đọc đúng label, error message |
| A11Y-07 | Required field | Submit form trống | aria-invalid="true", focus vào field đầu tiên invalid |
| A11Y-08 | Disabled state | Disabled button | aria-disabled="true", cursor not-allowed |

### 4.4. Test phân quyền (cross-page)

| # | Role | Page | Kỳ vọng |
|---|---|---|---|
| RBAC-01 | Admin | Tất cả | Thấy tất cả nút Sửa/Xóa/Tạo |
| RBAC-02 | NV_BanHang | `/thuoc` | Thấy danh sách, KHÔNG thấy nút Thêm/Sửa/Xóa |
| RBAC-03 | NV_BanHang | `/nhan-vien` | 403 (route guard) |
| RBAC-04 | NV_BanHang | `/kho` | Xem được Hub Kho, KHÔNG có nút "Nhập thuốc" |
| RBAC-05 | NV_Kho | `/ban-hang` | 403 (route guard) |
| RBAC-06 | NV_Kho | `/kho/ton-kho` | Xem được, có nút "Điều chỉnh" |
| RBAC-07 | NV_Kho | `/tai-chinh` | 403 |
| RBAC-08 | NV_Kho | `/khach-hang` | Xem được (theo rule hiện tại) |

---

## 5. Đề xuất cải thiện chi tiết

### 5.1. Component dùng chung cần bổ sung

> Trước khi refactor page, cần có sẵn các "viên gạch" sau:

#### A. `<FormField>` — Wrapper Input + Label + Error + Hint

```jsx
// frontend/src/components/ui/FormField.jsx
import { useId } from 'react';
import { cn } from '../../utils/cn';

/**
 * FormField — Wrapper thống nhất label + error + hint + required indicator.
 *
 * @example
 *   <FormField label="Tên thuốc" required error={errors.tenThuoc} hint="Tối đa 200 ký tự">
 *     <Input value={...} onChange={...} invalid={!!errors.tenThuoc} />
 *   </FormField>
 */
export default function FormField({ label, error, hint, required, children, className }) {
  const id = useId();
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-body font-medium text-neutral-700">
          {label}
          {required && <span className="text-danger-600 ml-0.5">*</span>}
        </label>
      )}
      {/* clone child với id + aria-invalid */}
      {children}
      {error && <p className="mt-1 text-caption text-danger-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-caption text-neutral-500">{hint}</p>}
    </div>
  );
}
```

#### B. `useFormState` hook — Quản lý field-level validation

```jsx
// frontend/src/hooks/useFormState.js
import { useState, useCallback, useMemo } from 'react';

/**
 * useFormState — Quản lý values + errors + dirty + submit cho form.
 *
 * @example
 *   const form = useFormState(
 *     { tenThuoc: '', gia: 0 },
 *     {
 *       tenThuoc: [required('Tên không được trống'), maxLength(200)],
 *       gia: [positiveNumber('Giá phải ≥ 0')],
 *     }
 *   );
 *
 *   <Input {...form.field('tenThuoc')} />
 *   <Button onClick={form.submit} disabled={!form.isValid}>Lưu</Button>
 */
export function useFormState(initialValues, validatorsByField) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitCount, setSubmitCount] = useState(0);

  const setValue = useCallback((field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const errors = useMemo(() => {
    const result = {};
    for (const field in validatorsByField) {
      const rules = validatorsByField[field] || [];
      for (const rule of rules) {
        const err = rule(values[field], values);
        if (err) { result[field] = err; break; }
      }
    }
    return result;
  }, [values, validatorsByField]);

  const field = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (e) => setValue(name, e?.target?.value ?? e),
    onBlur: () => handleBlur(name),
    error: (touched[name] || submitCount > 0) ? errors[name] : '',
    'aria-invalid': !!errors[name] || undefined,
  });

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const handleSubmit = useCallback(async (onValid) => {
    setSubmitCount((c) => c + 1);
    if (!isValid) return false;
    return onValid(values);
  }, [isValid]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setSubmitCount(0);
  }, [initialValues]);

  return { values, errors, isValid, isDirty, field, setValue, submit: handleSubmit, reset };
}

// ─── Built-in validators ────────────────────────────────
export const required = (msg = 'Trường này là bắt buộc') =>
  (v) => (!v || (typeof v === 'string' && !v.trim())) ? msg : null;

export const maxLength = (n, msg) =>
  (v) => (v && String(v).length > n ? (msg || `Tối đa ${n} ký tự`) : null);

export const minLength = (n, msg) =>
  (v) => (v && String(v).trim().length < n ? (msg || `Tối thiểu ${n} ký tự`) : null);

export const positiveNumber = (msg = 'Phải ≥ 0') =>
  (v) => (v !== '' && v != null && Number(v) < 0 ? msg : null);

export const phoneVN = (msg = 'SĐT phải 10–11 chữ số, bắt đầu bằng 0') =>
  (v) => (v && !/^0[0-9]{9,10}$/.test(String(v).replace(/\s/g, '')) ? msg : null);

export const email = (msg = 'Email không hợp lệ') =>
  (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : null);
```

#### C. `<FormFooter>` — Sticky footer cho modal dài

```jsx
// frontend/src/components/ui/FormFooter.jsx
import { cn } from '../../utils/cn';

/**
 * FormFooter — Sticky footer cho modal có form dài (vd PhieuNhapCreate).
 *
 * @example
 *   <Modal>
 *     <form>
 *       <div className="space-y-4">{fields}</div>
 *       <FormFooter>
 *         <Button variant="secondary" onClick={onCancel}>Hủy</Button>
 *         <Button variant="primary" type="submit">Lưu</Button>
 *       </FormFooter>
 *     </form>
 *   </Modal>
 */
export default function FormFooter({ children, className }) {
  return (
    <div className={cn(
      'sticky bottom-0 -mx-6 -mb-4 mt-4 border-t border-neutral-200 bg-white px-6 py-3',
      'flex items-center justify-end gap-2',
      className
    )}>
      {children}
    </div>
  );
}
```

#### D. `<useDirtyCheck>` — Cảnh báo khi đóng modal có thay đổi

```jsx
// frontend/src/hooks/useDirtyCheck.js
import { useEffect } from 'react';

/**
 * useDirtyCheck — Prompt user khi đóng modal có thay đổi chưa lưu.
 *
 * @example
 *   useDirtyCheck(modalOpen, isDirty, () => setModalOpen(false));
 */
export function useDirtyCheck(open, isDirty, onClose) {
  useEffect(() => {
    if (!open || !isDirty) return;

    const handler = (e) => {
      e.preventDefault();
      e.returnValue = 'Bạn có thay đổi chưa lưu. Đóng?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [open, isDirty]);

  // Wrap onClose để confirm trước khi đóng
  const safeClose = () => {
    if (isDirty) {
      const ok = window.confirm('Bạn có thay đổi chưa lưu. Đóng?');
      if (!ok) return;
    }
    onClose();
  };

  return safeClose;
}
```

> ⚠️ `window.confirm` ở đây là **exception** (chỉ dùng khi user cố ý đóng, không phải xác nhận xóa data) — vẫn OK theo UI_DESIGN_SYSTEM mục 10.1.

### 5.2. Refactor các page CRUD đơn giản

> Áp dụng `useFormState` + raw `<button>` → `<Button>` cho 5 page: `DanhMucPage`, `ThuocListPage`, `KhachHangPage`, `NhanVienPage`, `NhaCungCapPage`.

#### Ví dụ: `DanhMucPage` sau refactor

```jsx
// frontend/src/pages/thuoc/DanhMucPage.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FolderTree, Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import danhMucService from '../../services/danhMucService';
import RoleGuard from '../../components/ui/RoleGuard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useFormState, required, maxLength } from '../../hooks/useFormState';
import { useDirtyCheck } from '../../hooks/useDirtyCheck';

function DanhMucPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const form = useFormState(
    { maDM: '', tenDM: '' },
    {
      maDM: [required('Mã danh mục là bắt buộc'), maxLength(20)],
      tenDM: [required('Tên danh mục là bắt buộc'), maxLength(200)],
    }
  );

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await danhMucService.getAll();
      setItems(res.data || []);
    } catch {
      toast.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const safeCloseModal = useDirtyCheck(modalOpen, form.isDirty, () => {
    setModalOpen(false);
    form.reset();
    setEditing(null);
  });

  const openCreate = () => {
    form.reset();
    setEditing(null);
    setSubmitError('');
    setModalOpen(true);
  };

  const openEdit = (it) => {
    setEditing(it);
    setSubmitError('');
    form.setValue('maDM', it.MaDM);
    form.setValue('tenDM', it.TenDM);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    await form.submit(async (values) => {
      setSubmitting(true);
      setSubmitError('');
      try {
        if (editing) {
          await danhMucService.update(editing.MaDM, { tenDM: values.tenDM.trim() });
          toast.success('Cập nhật danh mục thành công');
        } else {
          await danhMucService.create({ maDM: values.maDM.trim(), tenDM: values.tenDM.trim() });
          toast.success('Tạo danh mục thành công');
        }
        safeCloseModal();
        fetchData();
      } catch (err) {
        const msg = err.response?.data?.error?.message || 'Thao tác thất bại';
        setSubmitError(msg);
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await danhMucService.remove(confirmDeleteId);
      toast.success('Xóa danh mục thành công');
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Không thể xóa');
    } finally {
      setDeleting(false);
    }
  };

  // ... columns gần như giữ nguyên, thay `<button>` Sửa/Xóa bằng `<Button variant="ghost" size="sm">`

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FolderTree />}
        title="Quản lý danh mục"
        subtitle={`Danh sách nhóm thuốc — ${items.length} danh mục`}
        actions={
          <RoleGuard roles={['Admin']}>
            <Button variant="primary" icon={<Plus />} onClick={openCreate}>
              Thêm danh mục
            </Button>
          </RoleGuard>
        }
      />

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={<FolderOpen />}
          title="Chưa có danh mục nào"
          description="Tạo danh mục đầu tiên để phân loại thuốc"
          action={
            <RoleGuard roles={['Admin']}>
              <Button variant="primary" icon={<Plus />} onClick={openCreate}>
                Tạo danh mục
              </Button>
            </RoleGuard>
          }
        />
      ) : (
        <Table columns={columns} data={items} loading={loading} rowKey="MaDM" />
      )}

      <Modal
        open={modalOpen}
        onClose={safeCloseModal}
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <Input
            label="Mã danh mục"
            required
            disabled={!!editing}
            hint={editing ? 'Không thể thay đổi mã' : 'VD: DM001'}
            maxLength={20}
            {...form.field('maDM')}
          />
          <Input
            label="Tên danh mục"
            required
            placeholder="VD: Kháng sinh"
            maxLength={200}
            {...form.field('tenDM')}
          />

          {submitError && (
            <div className="p-3 bg-danger-50 border border-danger-100 rounded-btn text-caption text-danger-700">
              {submitError}
            </div>
          )}

          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="secondary" onClick={safeCloseModal} disabled={submitting}>
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={submitting}
              disabled={!form.isValid}
            >
              {editing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Xóa danh mục"
        message={
          deletingItem
            ? `Bạn có chắc muốn xóa danh mục "${deletingItem.TenDM}"?${
                deletingItem.SoThuoc > 0 ? ` Có ${deletingItem.SoThuoc} thuốc thuộc danh mục này.` : ''
              }`
            : ''
        }
        confirmLabel="Xóa"
      />
    </div>
  );
}
```

**Kết quả:**
- Modal không cho submit khi invalid.
- Lỗi hiển thị **đúng field** (đỏ dưới input).
- Đóng modal khi dirty → confirm trước.
- Nút Sửa/Xóa đồng nhất qua `<Button>`.

### 5.3. Bổ sung field nghiệp vụ cho các page CRUD

#### `KhachHangPage` — Modal Create/Edit cần thêm:

| Field | Loại | Rule | Lý do |
|---|---|---|---|
| Email | Input email | optional, format email | Liên lạc, marketing |
| Ngày sinh | Input date | optional, < today | Phân khúc theo tuổi, chúc mừng sinh nhật |
| Địa chỉ | Textarea | optional, max 500 | Giao hàng (tương lai) |
| Ghi chú | Textarea | optional, max 1000 | Dị ứng thuốc, lưu ý đặc biệt |

#### `NhanVienPage` — Modal Create/Edit cần thêm:

| Field | Loại | Rule | Lý do |
|---|---|---|---|
| Email | Input email | optional | Liên lạc nội bộ |
| CCCD/CMND | Input text | optional, 9-12 số | Chứng từ nhân sự |
| Địa chỉ | Textarea | optional | Hồ sơ |
| Ngày ký HĐ | Input date | optional | Theo dõi thâm niên |
| Mã số thuế | Input text | optional | Thuế TNCN |
| Vai trò | Select | bắt buộc | Phân quyền |
| Toggle "Tạo tài khoản ngay" | Checkbox | optional | UX tiện hơn |

#### `NhaCungCapPage` — Modal Create/Edit cần thêm:

| Field | Loại | Rule | Lý do |
|---|---|---|---|
| Email | Input email | optional | Liên hệ |
| Website | Input url | optional, format URL | Tham khảo |
| Mã số thuế | Input text | optional | Hóa đơn |
| Người liên hệ | Input text | optional | Liên hệ trực tiếp |
| SĐT người LH | Input tel | optional, format VN | Liên hệ trực tiếp |
| Ghi chú | Textarea | optional | Điều khoản đặc biệt |

### 5.4. Mở rộng `Button` component

```jsx
// Trong Button.jsx — thêm prop `iconClassName`
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  iconClassName = '',       // ← MỚI
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  // ...
  return (
    <button ...>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className={cn('inline-flex', iconClassName)}>{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && iconRight && (
        <span className={cn('inline-flex', iconClassName)}>{iconRight}</span>
      )}
    </button>
  );
}
```

**Dùng:**
```jsx
<Button
  variant="ghost"
  size="sm"
  icon={<Trash2 className="w-4 h-4" />}
  iconClassName="text-danger-600"
  onClick={() => setConfirmDeleteId(it.MaKH)}
  aria-label={`Xóa ${it.TenKH}`}
/>
```

### 5.5. Thêm bulk actions cho Table

```jsx
// Trong Table.jsx — thêm prop selection
<Table
  columns={columns}
  data={items}
  rowKey="MaThuoc"
  selection={{
    enabled: isAdmin,
    selectedIds,
    onChange: setSelectedIds,
  }}
  bulkActions={
    selectedIds.length > 0 && (
      <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-btn">
        <span className="text-body font-medium text-primary-800">
          Đã chọn {selectedIds.length} mục
        </span>
        <Button variant="danger" size="sm" icon={<Trash2 />} onClick={handleBulkDelete}>
          Xóa hàng loạt
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
          Bỏ chọn
        </Button>
      </div>
    )
  }
/>
```

> Áp dụng cho: `ThuocListPage`, `DanhMucPage`, `KhachHangPage`, `NhaCungCapPage`.

### 5.6. Thêm nút In/Xuất PDF cho HoaDon + PhieuNhap

> (Tùy chọn, cần backend hỗ trợ endpoint in)

```jsx
// Trong HoaDonListPage detail modal
<Button
  variant="secondary"
  icon={<Printer />}
  onClick={() => window.open(`/api/hoa-don/${viewItem.MaHD}/print`, '_blank')}
>
  In hóa đơn
</Button>
```

### 5.7. Cải thiện `HoaDonListPage` filter

```jsx
// Thêm filter trạng thái
<Select
  label="Trạng thái"
  value={trangThai}
  onChange={setTrangThai}
  options={[
    { value: '', label: 'Tất cả' },
    { value: 'DaThanhToan', label: 'Đã thanh toán' },
    { value: 'DaHuy', label: 'Đã hủy' },
  ]}
/>
```

### 5.8. Centralize role constants

```js
// utils/constants.js — thêm
export const ROLE_GROUPS = {
  ALL_ADMIN: ['Admin'],
  WRITE_KHO: ['Admin', 'NV_Kho'],
  WRITE_BANHANG: ['Admin', 'NV_BanHang'],
  FULL_ACCESS: ['Admin', 'NV_BanHang', 'NV_Kho'],
};
```

```jsx
// Dùng:
<RoleGuard roles={ROLE_GROUPS.WRITE_KHO}>
  <Button onClick={openEdit}>Sửa</Button>
</RoleGuard>
```

---

## 6. Roadmap cải thiện ưu tiên

> Ước lượng tham khảo — điều chỉnh theo năng lực team.

### 🟢 Sprint 1 (1.5 ngày) — Foundation + Quick wins

| # | Task | Effort | File chính |
|---|---|---|---|
| 1 | Thêm `FormField`, `FormFooter`, `useFormState`, `useDirtyCheck` | 0.5 ngày | `components/ui/`, `hooks/` |
| 2 | Thêm `ROLE_GROUPS` vào `utils/constants.js` | 0.1 ngày | `utils/constants.js` |
| 3 | Thêm prop `iconClassName` cho `Button` | 0.1 ngày | `components/ui/Button.jsx` |
| 4 | Thêm `BulkActions` cho `Table` | 0.3 ngày | `components/ui/Table.jsx` |
| 5 | Replace 5 file `toLocaleDateString` → `formatDate()` | 0.1 ngày | 5 page đã liệt kê |
| 6 | Replace raw `<button>` → `<Button>` trong 8 page | 0.4 ngày | 8 page |

**Kết quả:** Foundation sẵn sàng, các page có thể refactor nhanh.

### 🟡 Sprint 2 (2 ngày) — Refactor 5 page CRUD đơn giản

| # | Task | Effort | File chính |
|---|---|---|---|
| 7 | Refactor `DanhMucPage` dùng `useFormState` | 0.3 ngày | `pages/thuoc/DanhMucPage.jsx` |
| 8 | Refactor `ThuocListPage` + thêm field SKU | 0.5 ngày | `pages/thuoc/ThuocListPage.jsx` |
| 9 | Refactor `KhachHangPage` + thêm Email/Ngày sinh/Địa chỉ | 0.5 ngày | `pages/khachhang/KhachHangPage.jsx` |
| 10 | Refactor `NhanVienPage` + thêm CCCD/MST/tạo TK | 0.6 ngày | `pages/nhanvien/NhanVienPage.jsx` |
| 11 | Refactor `NhaCungCapPage` + thêm Email/Website/MST | 0.4 ngày | `pages/nhacungcap/NhaCungCapPage.jsx` |

**Kết quả:** 5 page CRUD có validation chuẩn, field đầy đủ, UX nhất quán.

### 🟠 Sprint 3 (1.5 ngày) — Polish detail + add features

| # | Task | Effort | File chính |
|---|---|---|---|
| 12 | Refactor `HoaDonListPage` thêm filter trạng thái + nút In | 0.4 ngày | `pages/banhang/HoaDonListPage.jsx` |
| 13 | Refactor `PhieuNhapListPage` thêm nút In + filter trạng thái | 0.4 ngày | `pages/kho/PhieuNhapListPage.jsx` |
| 14 | Refactor `PhieuChiListPage` thêm dropdown loại chi phí | 0.3 ngày | `pages/taichinh/PhieuChiListPage.jsx` |
| 15 | Thêm bulk actions cho 4 page CRUD | 0.4 ngày | `ThuocListPage`, `DanhMucPage`, `KhachHangPage`, `NhaCungCapPage` |

**Kết quả:** Các page list/transaction có tính năng nâng cao.

### 🔵 Sprint 4 (1 ngày) — Polish + A11y

| # | Task | Effort | File chính |
|---|---|---|---|
| 16 | A11y pass toàn bộ modal (test NVDA/VoiceOver) | 0.4 ngày | (test cross-page) |
| 17 | Thêm Keyboard shortcut: Enter submit, Cmd+S save | 0.3 ngày | hook `useFormState` |
| 18 | Animation subtle (modal slide-up, toast smooth) | 0.3 ngày | `index.css` + Modal |

**Tổng 4 sprint: ~6 ngày làm việc (~1.5 tuần).**

### Đề xuất thứ tự thực hiện nếu chỉ có 2-3 ngày

| Ưu tiên | Task | Lý do |
|:-:|---|---|
| **P0** | (1) Foundation components | Cần có trước khi refactor |
| **P0** | (5) Fix `toLocaleDateString` | Lỗi nhỏ, fix nhanh, đúng chuẩn |
| **P0** | (3) `iconClassName` cho Button | Tiền đề cho (6) |
| **P1** | (6) Replace raw `<button>` | Cleanup, đồng nhất |
| **P1** | (7) Refactor `DanhMucPage` | Modal đơn giản nhất → làm mẫu trước |
| **P2** | (8)-(11) Refactor 4 page CRUD còn lại | Apply pattern từ (7) |

---

## 7. Checklist Definition of Done

### Definition of Done cho 1 modal sau refactor

- [ ] Sử dụng `useFormState` cho validation field-level.
- [ ] Nút Submit disable khi form invalid.
- [ ] Nút Sửa/Xóa dùng `<Button variant="ghost" size="sm">` (không raw `<button>`).
- [ ] Confirm dialog khi đóng modal có dirty data.
- [ ] Hiển thị lỗi field-level (đỏ dưới input) + lỗi tổng từ BE (alert đỏ riêng).
- [ ] Loading state: button show spinner, không cho double-click.
- [ ] ESC đóng modal, focus trả về trigger.
- [ ] Tab navigation đúng thứ tự label → input → nút.
- [ ] `aria-label` cho icon button.
- [ ] `aria-invalid` cho field invalid.
- [ ] Pass keyboard test: Tab 10 lần không bị "kẹt".
- [ ] Pass screen reader test (NVDA/VoiceOver).
- [ ] Không hardcode color (mọi thứ qua semantic token).
- [ ] Không có `toLocaleDateString` (dùng `formatDate()`).
- [ ] Có ảnh chụp trước/sau trong docs/PR.

### Definition of Done cho toàn bộ plan

- [ ] Tất cả 5 page CRUD chính đã dùng `useFormState`.
- [ ] Tất cả `<button>` action Sửa/Xóa đã chuyển sang `<Button>`.
- [ ] Tất cả `toLocaleDateString` đã thay bằng `formatDate()`.
- [ ] 0 `window.confirm` xác nhận xóa (chỉ dùng trong dirty-check là exception).
- [ ] Tất cả role check dùng `ROLE_GROUPS` từ constants.
- [ ] Tab navigation ổn định trên mọi modal.
- [ ] Đã test 3 role (Admin, NV_BanHang, NV_Kho) trên mọi page.
- [ ] Cập nhật `docs/UI_DESIGN_SYSTEM.md` nếu thêm component mới (`FormField`, `FormFooter`).
- [ ] Cập nhật README.md → thêm link `docs/CRUD_MODAL_AUDIT.md`.
- [ ] ESLint clean (`npm run lint` trong `frontend/`).
- [ ] Ảnh chụp trước/sau cho mỗi page đã refactor.

### Công cụ kiểm tra nhanh

```bash
# 1. Tìm window.confirm xác nhận xóa (đã OK — chỉ trong ConfirmDialog.jsx)
rg "window\.confirm" frontend/src/

# 2. Tìm toLocaleDateString
rg "toLocaleDateString" frontend/src/

# 3. Tìm hardcode color trong page
rg "bg-(green|red|blue|yellow|gray)-(50|100|500|700)" frontend/src/pages/

# 4. Tìm raw <button> action Sửa/Xóa
rg "onClick=\{[^}]*setConfirmDeleteId" frontend/src/

# 5. ESLint
cd frontend && npm run lint
```

---

## 📞 Liên hệ

- File vấn đề / đề xuất: tạo issue trên repo
- Component mới → cập nhật `docs/UI_DESIGN_SYSTEM.md` mục 7
- Anti-pattern → check `docs/UI_DESIGN_SYSTEM.md` mục 10 + mục 3 trong file này

> 🎓 *"Một modal hoàn chỉnh không chỉ submit được — mà còn dạy user cách dùng, cảnh báo khi sai, và tha thứ khi user lỡ đóng nhầm."*