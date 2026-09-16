# Hệ thống Thông báo & Xác nhận

> Hướng dẫn sử dụng `react-hot-toast` (thông báo) và `ConfirmDialog` (xác nhận) trong SecurePharma.

---

## 1. Tổng quan

| Thành phần | Mục đích | File |
|---|---|---|
| `<Toaster />` | Container toàn cục hiển thị toast | `frontend/src/main.jsx` |
| `toast.success(msg)` | Thông báo thành công | `react-hot-toast` |
| `toast.error(msg)` | Thông báo lỗi | `react-hot-toast` |
| `<ConfirmDialog />` | Hộp thoại xác nhận (xóa, hủy…) | `frontend/src/components/ui/ConfirmDialog.jsx` |

> ⚠️ **QUAN TRỌNG:** `<Toaster />` đã được mount **một lần duy nhất** ở `main.jsx`. **Không** mount thêm ở các page khác — sẽ tạo ra container trùng lặp.

---

## 2. Quy tắc sử dụng Toast

### 2.1. Khi nào dùng

| Hành động | Toast dùng | Vì sao |
|---|---|---|
| Tạo mới (Create) thành công | `toast.success('Tạo … thành công')` | Phản hồi rõ ràng cho người dùng |
| Cập nhật (Update) thành công | `toast.success('Cập nhật … thành công')` | — |
| Xóa (Delete) thành công | `toast.success('Xóa … thành công')` | — |
| Validate form lỗi | `toast.error('Vui lòng nhập …')` | Trước khi submit API |
| API trả lỗi | `toast.error(err.response?.data?.error?.message)` | Lấy message từ backend |
| Load danh sách lỗi | `toast.error('Không thể tải …')` | Bắt buộc, **không được** silent |

### 2.2. Pattern chuẩn cho CRUD

```jsx
import toast from 'react-hot-toast';
import thuocService from '../../services/thuocService';

// CREATE / UPDATE
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    if (editingItem) {
      await thuocService.update(editingItem.MaThuoc, payload);
      toast.success('Cập nhật thuốc thành công');
    } else {
      await thuocService.create(payload);
      toast.success('Tạo thuốc thành công');
    }
    setModalOpen(false);
    fetchData();
  } catch (err) {
    const msg = err.response?.data?.error?.message || 'Thao tác thất bại';
    setFormError(msg);  // Hiển thị trong form
    toast.error(msg);   // Hiển thị toast
  } finally {
    setSubmitting(false);
  }
};

// DELETE
const handleDelete = async () => {
  if (!confirmDeleteId) return;
  setDeleting(true);
  try {
    await thuocService.remove(confirmDeleteId);
    toast.success('Xóa thành công');
    setConfirmDeleteId(null);
    fetchData();
  } catch (err) {
    toast.error(err.response?.data?.error?.message || 'Không thể xóa');
  } finally {
    setDeleting(false);
  }
};
```

### 2.3. KHÔNG được dùng

```jsx
// ❌ Sai — nuốt lỗi, user không biết gì xảy ra
try {
  await someService.load();
} catch { /* silent */ }

// ✅ Đúng — báo lỗi cho user
try {
  await someService.load();
} catch (err) {
  toast.error(err.response?.data?.error?.message || 'Không thể tải');
}
```

---

## 3. Quy tắc sử dụng ConfirmDialog

### 3.1. Khi nào BẮT BUỘC dùng

| Hành động | Bắt buộc confirm? | Lý do |
|---|---|---|
| **Xóa** thuốc / danh mục / KH / NV / NCC | ✅ Có | Mất dữ liệu không phục hồi |
| **Hủy** hóa đơn | ✅ Có | Ảnh hưởng tài chính, hoàn kho |
| **Hủy** phiếu nhập | ✅ Có | Ảnh hưởng tồn kho, audit |
| **Điều chỉnh tồn kho** | ⚠️ Có form riêng (không cần ConfirmDialog vì đã có lý do bắt buộc) | Audit trail |
| Thêm / Sửa thường | ❌ Không | Cho phép đóng modal = hủy |

### 3.2. Pattern chuẩn

```jsx
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// 1. State
const [confirmDeleteId, setConfirmDeleteId] = useState(null);
const [deleting, setDeleting] = useState(false);

// 2. Handler
const handleDelete = async () => {
  if (!confirmDeleteId) return;
  setDeleting(true);
  try {
    await service.remove(confirmDeleteId);
    toast.success('Xóa thành công');
    setConfirmDeleteId(null);
    fetchData();
  } catch (err) {
    toast.error(err.response?.data?.error?.message || 'Không thể xóa');
  } finally {
    setDeleting(false);
  }
};

// 3. JSX
<button
  type="button"
  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.MaThuoc); }}
  className="..."
>
  <Trash2 />
</button>

<ConfirmDialog
  open={!!confirmDeleteId}
  onClose={() => setConfirmDeleteId(null)}
  onConfirm={handleDelete}
  loading={deleting}
  title="Xóa thuốc"
  message={
    deletingItem
      ? `Bạn có chắc chắn muốn xóa thuốc "${deletingItem.TenThuoc}"? Hành động này không thể hoàn tác.`
      : ''
  }
  confirmLabel="Xóa"
  variant="danger"
/>
```

### 3.3. Props của ConfirmDialog

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `open` | boolean | — | Hiển thị modal |
| `onClose` | function | — | Đóng modal (Hủy / click ra ngoài / ESC) |
| `onConfirm` | function | — | Xác nhận hành động |
| `title` | string | 'Xác nhận' | Tiêu đề |
| `message` | string | — | Nội dung (có thể là ReactNode) |
| `confirmLabel` | string | 'Xác nhận' | Nhãn nút confirm |
| `cancelLabel` | string | 'Hủy' | Nhãn nút hủy |
| `variant` | `'danger'` \| `'warning'` \| `'info'` | `'danger'` | Style icon + nút confirm |
| `loading` | boolean | `false` | Disable nút + hiển thị spinner khi đang xử lý |

### 3.4. KHÔNG dùng `window.confirm`

```jsx
// ❌ Sai — trải nghiệm kém, không thể style
if (window.confirm('Bạn có chắc muốn xóa?')) {
  await service.remove(id);
}

// ✅ Đúng — dùng ConfirmDialog component
<ConfirmDialog ... />
```

---

## 4. Checklist khi thêm trang mới

Khi tạo page CRUD mới, tự kiểm:

- [ ] `import toast from 'react-hot-toast';`
- [ ] `import ConfirmDialog from '../../components/ui/ConfirmDialog';`
- [ ] State `confirmDeleteId`, `deleting`
- [ ] `handleDelete` gọi `toast.success/error`
- [ ] `handleSubmit` gọi `toast.success/error` cho cả create và update
- [ ] Mọi `catch` đều có `toast.error` (KHÔNG silent)
- [ ] Nút xóa gọi `setConfirmDeleteId(item.id)` thay vì `window.confirm`
- [ ] Mount `<ConfirmDialog>` trong JSX

---

## 5. Customize Toast (nếu cần)

Sửa ở `main.jsx`:

```jsx
<Toaster
  position="top-right"        // top-right | top-center | top-left | bottom-...
  toastOptions={{
    duration: 3000,            // ms — mặc định
    success: { iconTheme: { primary: '#16a34a' } },
    error: { duration: 4000 }, // lỗi hiển thị lâu hơn
  }}
/>
```

Hoặc dùng cho 1 toast riêng:

```js
toast.success('Lưu thành công', {
  duration: 5000,
  icon: '✅',
  style: { background: '#f0fdf4', border: '1px solid #16a34a' },
});
```

---

## 6. Tài liệu tham khảo

- [react-hot-toast docs](https://react-hot-toast.com/)
- File component: `frontend/src/components/ui/ConfirmDialog.jsx`
- File mount: `frontend/src/main.jsx`
