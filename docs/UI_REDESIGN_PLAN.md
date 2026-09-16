# 🎨 UI REDESIGN PLAN — SecurePharma

> **Ngày lập:** 15/09/2026
> **Đi cùng:** `docs/UI_REVIEW.md` (audit) + `docs/UI_DESIGN_SYSTEM.md` (token contract)
> **Phương châm:** Sửa/làm mới dựa trên design system SẴN CÓ. Không tạo palette song song, không hardcode class.
> **Cấu trúc:** 6 phase (ưu tiên cao → thấp), mỗi phase có checklist file + đoạn code mẫu + ước lượng.

---

## 📋 Mục lục

1. [Nguyên tắc chung](#1-nguyên-tắc-chung)
2. [Phase A — Sửa lỗi cao (½ ngày)](#2-phase-a--sửa-lỗi-cao--½-ngày)
3. [Phase B — Nâng cấp component chung (1 ngày)](#3-phase-b--nâng-cấp-component-chung-1-ngày)
4. [Phase C — Polish từng page CRUD (1.5 ngày)](#4-phase-c--polish-từng-page-crud-15-ngày)
5. [Phase D — Dashboard dùng API thật (3-4 giờ)](#5-phase-d--dashboard-dùng-api-thật-3-4-giờ)
6. [Phase E — Tính năng nâng cao Header/Layout (1.5 ngày)](#6-phase-e--tính-năng-nâng-cao-headerlayout-15-ngày)
7. [Phase F — Animation + Dark mode (tùy chọn)](#7-phase-f--animation--dark-mode-tùy-chọn)
8. [Checklist tổng kết + Definition of Done](#8-checklist-tổng-kết--definition-of-done)

---

## 1. Nguyên tắc chung

> **Trước khi sửa BẤT KỲ file nào, đọc lại `docs/UI_DESIGN_SYSTEM.md` mục 7 (Component) + mục 10 (Anti-patterns).**

**Quy tắc bất di bất dịch:**

| ✅ LÀM | ❌ KHÔNG |
|---|---|
| Dùng `<Button variant="...">` thay vì class Tailwind raw | Hardcode `bg-primary-600 text-white rounded-btn` |
| Dùng `<Badge variant="success">` | Hardcode `bg-green-100 text-green-700` |
| Dùng `<Input label error icon>` | Hardcode `<input className="w-full px-3 py-2 border">` |
| Dùng `<Modal>` + `<ConfirmDialog>` | Hardcode `<div className="fixed inset-0 bg-black/50">` |
| Dùng `<EmptyState>` `<LoadingState>` `<Pagination>` | Hardcode `<div>Không có dữ liệu</div>` |
| Gọi `formatCurrency()` `formatDate()` | `new Date().toLocaleDateString()` ngẫu nhiên |
| Memo hóa function tính toán | Inline `(items.length * 1.1).toFixed(2)` trong JSX |

**Tiêu chuẩn Definition of Done cho 1 task:**

- [ ] Có JSDoc đầy đủ ở đầu hàm/page
- [ ] ESC + Tab + focus ring hoạt động (test thủ công)
- [ ] Không có icon import thừa (eslint clean)
- [ ] Không hardcode màu/spacing — đều qua token
- [ ] Có ảnh chụp trước/sau nếu thay đổi layout (cho báo cáo)

---

## 2. Phase A — Sửa lỗi cao (½ ngày)

> ⚠️ **Làm NGAY, làm TRƯỚC.** Đây là lỗi logic/phân quyền — không phải "polish".

### A.1. Sửa `NhanVienPage.jsx` — thiếu RoleGuard

**File:** `frontend/src/pages/nhanvien/NhanVienPage.jsx`

**Vấn đề:** PageHeader actions và column "Thao tác" hiển thị cho mọi role, chỉ có route guard (`ProtectedRoute`) chặn. UI vẫn hiện nút Sửa/Xoá → nhân viên bán thuốc nếu gõ URL `/nhan-vien` sẽ thấy nút (mặc dù API sẽ trả 403).

**Cách sửa:**

Trước (line 218-225):
```jsx
actions={
  <Button variant="primary" icon={<Plus />} onClick={openCreate}>
    Thêm nhân viên
  </Button>
}
```

Sau:

```jsx
actions={
  <RoleGuard roles={['Admin']}>
    <Button variant="primary" icon={<Plus />} onClick={openCreate}>
      Thêm nhân viên
    </Button>
  </RoleGuard>
}
```

Trước (line 188-209 — column "actions"):

```jsx
render: (it) => (
  <div className="flex items-center justify-end gap-1">
    <button ... openEdit ...><Edit2 /></button>
    <button ... setConfirmDeleteId ...><Trash2 /></button>
  </div>
),
```

Sau (bọc RoleGuard + đổi thành component Button dùng chung):

```jsx
render: (it) => (
  <RoleGuard roles={['Admin']}>
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        icon={<Edit2 className="w-4 h-4" />}
        onClick={() => openEdit(it)}
        aria-label="Sửa"
      />
      <Button
        variant="ghost"
        size="sm"
        icon={<Trash2 className="w-4 h-4 text-danger-600" />}
        onClick={() => setConfirmDeleteId(it.MaNV)}
        aria-label="Xóa"
      />
    </div>
  </RoleGuard>
),
```

> 🎁 Bonus: chuyển sang `Button` component giúp đồng nhất focus ring + hover state.

**Checklist:**
- [ ] Mở `/nhan-vien` bằng tài khoản `banhang.minh` → KHÔNG thấy nút "Thêm", "Sửa", "Xoá".
- [ ] Mở `/nhan-vien` bằng `admin.huong` → thấy đầy đủ.

---

### A.2. Đồng bộ `formatDate()` ở 3 page

**Files:**

- `frontend/src/pages/nhanvien/NhanVienPage.jsx` (line ~180)
- `frontend/src/pages/khachhang/KhachHangPage.jsx` (line ~145)
- `frontend/src/pages/thuoc/DanhMucPage.jsx` (line ~140)

**Cú pháp tìm nhanh:**

```bash
rg "toLocaleDateString\('vi-VN'\)" frontend/src/pages/
```

**Sửa:**

Trước:
```jsx
{it.NgayVaoLam ? new Date(it.NgayVaoLam).toLocaleDateString('vi-VN') : '—'}
```

Sau:
```jsx
import { formatDate } from '../../utils/format';
// ...
{it.NgayVaoLam ? formatDate(it.NgayVaoLam, 'DD/MM/YYYY') : '—'}
```

> 💡 `formatDate` đã có sẵn trong `utils/format.js`, đã được dùng ở `LoginPage`/`ChangePasswordPage` — chỉ thiếu ở 3 page này.

**Checklist:** grep lại → 0 kết quả `toLocaleDateString('vi-VN')`.

---

### A.3. Replace spinner cũ ở `ThuocDetailPage`

**File:** `frontend/src/pages/thuoc/ThuocDetailPage.jsx` (line 46-49)

**Trước:**
```jsx
return (
  <div className="flex items-center justify-center py-20">
    <div className="spinner" aria-label="Đang tải" />
  </div>
);
```

**Sau:**
```jsx
import LoadingState from '../../components/ui/LoadingState';
// ...
return <LoadingState label="Đang tải thông tin thuốc..." />;
```

> `LoadingState` đã có sẵn trong design system — chỉ `<div className="spinner">` là legacy.

---

## 3. Phase B — Nâng cấp component chung (1 ngày)

> Các thay đổi này tái sử dụng cho tất cả page. Làm một lần — các page sẽ tự đẹp lên.

### B.1. Nâng cấp `Pagination.jsx` — thêm số trang + jump-to-page

**File:** `frontend/src/components/ui/Pagination.jsx`

**Hiện tại:** Chỉ Prev/Next, không có số trang (UX khó chịu khi totalPages = 30).

**Mục tiêu:** Hiển thị `1 ... 4 [5] 6 ... 30` + ô input nhảy trang.

**Code mẫu:**

```jsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import Input from './Input';

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({
  page, totalPages, total, onChange, loading = false, className,
}) {
  const [jump, setJump] = useState('');
  if (totalPages <= 1) return null;

  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;
  const pages = buildPageList(page, totalPages);

  const handleJump = (e) => {
    e.preventDefault();
    const n = parseInt(jump, 10);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(Math.max(1, n), totalPages);
    if (clamped !== page) onChange(clamped);
    setJump('');
  };

  const navBtn = 'h-9 w-9 flex items-center justify-center rounded-btn border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

  return (
    <nav
      aria-label="Phân trang"
      className={cn(
        'flex items-center justify-between gap-4 flex-wrap',
        'bg-white rounded-card shadow-card border border-neutral-200/60 px-4 py-3',
        className,
      )}
    >
      <div className="text-caption text-neutral-600">
        Trang <span className="font-semibold text-neutral-900">{page}</span> / {totalPages}
        <span className="ml-2">• {total.toLocaleString('vi-VN')} kết quả</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => onChange(1)} disabled={!canPrev} className={navBtn} aria-label="Trang đầu">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onChange(page - 1)} disabled={!canPrev} className={navBtn} aria-label="Trang trước">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-2 text-neutral-400">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              disabled={loading}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'h-9 min-w-9 px-2 rounded-btn text-body',
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >{p}</button>
          ),
        )}

        <button type="button" onClick={() => onChange(page + 1)} disabled={!canNext} className={navBtn} aria-label="Trang sau">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onChange(totalPages)} disabled={!canNext} className={navBtn} aria-label="Trang cuối">
          <ChevronsRight className="w-4 h-4" />
        </button>

        <form onSubmit={handleJump} className="flex items-center gap-1 ml-2">
          <Input
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            placeholder="→"
            className="w-14"
            inputClassName="h-9 text-center"
            aria-label="Nhảy tới trang"
          />
        </form>
      </div>
    </nav>
  );
}
```

**Test:**
- Tổng 50 kết quả, trang hiện tại 5/10 → hiển thị `1 ... 4 [5] 6 ... 10`
- Nhập `8` vào ô jump → bấm Enter → chuyển trang 8

---

### B.2. Thêm `Breadcrumb` component

**File mới:** `frontend/src/components/ui/Breadcrumb.jsx`

```jsx
/**
 * Breadcrumb — Tự build từ MENU_ITEMS theo currentPath
 *
 * @example <Breadcrumb currentPath={location.pathname} />
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { MENU_ITEMS } from '../../utils/constants';

function findCrumbs(path) {
  const items = [];
  const direct = MENU_ITEMS.find((m) => m.path === path);
  if (direct) return [direct];
  // Match nested (e.g. /thuoc/123)
  const parent = MENU_ITEMS.find((m) => path.startsWith(m.path + '/'));
  if (parent) {
    items.push({ key: parent.key, label: parent.label, path: parent.path });
    const detailLabel = path.split('/').filter(Boolean).pop();
    items.push({ key: 'detail', label: detailLabel, path });
  }
  return items;
}

export default function Breadcrumb({ currentPath, className }) {
  const crumbs = findCrumbs(currentPath);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-caption text-neutral-500 ${className || ''}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Trang chủ</span>
          </Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.key} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" aria-hidden="true" />
            {i === crumbs.length - 1 || c.path === currentPath ? (
              <span className="text-neutral-700 font-medium" aria-current="page">{c.label}</span>
            ) : (
              <Link to={c.path} className="hover:text-primary-600 transition-colors">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**Gắn vào `MainLayout.jsx`:** Thêm dưới `<Header>`:

```jsx
<main className="flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-4">
  <Breadcrumb currentPath={location.pathname} />
  <Outlet />
</main>
```

> 💡 Breadcrumb tự ẩn ở `/dashboard` (vì `findCrumbs` trả về direct match).

---

### B.3. Thêm `EmptyResults` variant cho empty state khi filter rỗng

**File:** `frontend/src/components/ui/EmptyState.jsx` — thêm prop `action` (đã có sẵn, chỉ cần tận dụng).

Trong **từng list page**, sửa logic render Table:

```jsx
<Table
  columns={columns}
  data={items}
  loading={loading}
  rowKey="MaThuoc"
  emptyTitle={filters.keyword ? 'Không tìm thấy thuốc phù hợp' : 'Chưa có thuốc nào'}
  emptyDescription={
    filters.keyword
      ? `Không có kết quả nào cho "${filters.keyword}". Thử bỏ filter hoặc đổi từ khoá khác.`
      : 'Bấm nút "Thêm thuốc" để tạo thuốc đầu tiên.'
  }
  emptyIcon={filters.keyword ? <SearchX /> : <Package />}
  emptyAction={
    filters.keyword ? (
      <Button variant="secondary" onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, keyword: '' })); }}>
        Xoá filter
      </Button>
    ) : (
      <RoleGuard roles={['Admin']}>
        <Button variant="primary" icon={<Plus />} onClick={openCreate}>
          Thêm thuốc
        </Button>
      </RoleGuard>
    )
  }
/>
```

> `SearchX` icon có trong `lucide-react`. Giả sử tên import: `import { SearchX } from 'lucide-react';` (nếu không có thì dùng `SearchSlash`).

---

### B.4. Realtime form validation — `useFormField` hook

**File mới:** `frontend/src/hooks/useFormField.js`

```js
import { useState } from 'react';

const VALIDATORS = {
  required: (v) => (!v || !String(v).trim() ? 'Trường này là bắt buộc' : null),
  email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Email không hợp lệ' : null),
  phoneVN: (v) => (v && !/^0[0-9]{9,10}$/.test(v.replace(/\s/g, '')) ? 'SĐT phải 10–11 chữ số, bắt đầu bằng 0' : null),
  positiveNumber: (v) => (v !== '' && v != null && Number(v) < 0 ? 'Phải ≥ 0' : null),
  maxLength: (n) => (v) => (v && String(v).length > n ? `Tối đa ${n} ký tự` : null),
  minLength: (n) => (v) => (v && String(v).trim().length < n ? `Tối thiểu ${n} ký tự` : null),
};

export function useFormField(initial = '', validators = []) {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);

  const error = (() => {
    for (const v of validators) {
      const result = typeof v === 'function' ? v(value) : VALIDATORS[v]?.(value);
      if (result) return result;
    }
    return null;
  })();

  return {
    value,
    onChange: (e) => { setValue(e.target.value); if (!touched) setTouched(true); },
    onBlur: () => setTouched(true),
    showError: touched && !!error,
    error,
    setValue,
    reset: () => { setValue(initial); setTouched(false); },
  };
}
```

**Cách dùng trong form CRUD** (ví dụ `KhachHangPage`):

```jsx
const tenKH = useFormField('', ['required', VALIDATORS.maxLength(200)]);
const sdt = useFormField('', [VALIDATORS.phoneVN]);
// ...
<Input
  label="Tên khách hàng"
  required
  value={tenKH.value}
  onChange={tenKH.onChange}
  onBlur={tenKH.onBlur}
  error={tenKH.showError ? tenKH.error : ''}
/>
<Input
  label="Số điện thoại"
  value={sdt.value}
  onChange={sdt.onChange}
  onBlur={sdt.onBlur}
  error={sdt.showError ? sdt.error : ''}
  hint="10–11 chữ số, bắt đầu bằng 0"
/>
```

**Checklist:**
- [ ] Mở form → tab qua field → quay lại → không thấy error ngay
- [ ] Gõ giá trị sai (e.g. `abc` cho SDT) → tab ra → thấy error đỏ dưới input
- [ ] Submit form có error → button "Tạo mới" tự disable

---

## 4. Phase C — Polish từng page CRUD (1.5 ngày)

> Sau khi component nâng cấp ở Phase B, mỗi page chỉ cần 10-20 phút polish.

### C.1. Bảng áp dụng đồng loạt cho 4 page CRUD

Áp dụng cho: `ThuocListPage`, `DanhMucPage`, `KhachHangPage`, `NhanVienPage`, `NhaCungCapPage`.

| Sửa | Mục | Nội dung |
|---|---|---|
| Date | formatDate() | (đã làm ở A.2) |
| Spinner inline | LoadingState | (A.3 + check các chỗ khác) |
| Action buttons | chuyển sang `<Button variant="ghost" size="sm">` | (đã làm ở A.1 cho NV) |
| Bọc RoleGuard | PageHeader.actions + column.actions | (A.1) |
| Empty | EmptyState có action | (B.3) |
| Filter Validate | hook useFormField | (B.4) |

### C.2. Chuyển icon-action buttons sang `<Button>` component

**Áp dụng ở mọi page có dạng:**

```jsx
<button
  type="button"
  onClick={...}
  className="p-1.5 rounded-btn text-info-600 hover:bg-info-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  title="Sửa"
>
  <Edit2 className="w-4 h-4" />
</button>
```

**Thành:**

```jsx
<Button
  variant="ghost"
  size="sm"
  icon={<Edit2 className="w-4 h-4" />}
  onClick={...}
  aria-label="Sửa"
/>
```

> Class `text-info-600 hover:bg-info-50` thì `ghost` variant không có sẵn → cần **mở rộng Button** (xem C.3) HOẶC giữ `<button>` raw cho mấy nút này (cũng OK).

### C.3. Mở rộng `Button` — hỗ trợ icon color override

**File:** `frontend/src/components/ui/Button.jsx`

Thêm prop `iconClassName` để icon có màu riêng (e.g. đỏ cho nút xoá).

```jsx
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  iconClassName = '',          // <-- MỚI
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  // ... đoạn đầu giữ nguyên
  return (
    <button ...>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
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

Sau đó:

```jsx
<Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} iconClassName="text-danger-600" aria-label="Xóa" />
```

---

## 5. Phase D — Dashboard dùng API thật (3-4 giờ)

> ⚠️ **Phụ thuộc backend xong Phase 3H (thống kê).** Nếu backend chưa xong, code theo spec dưới rồi wire lại sau.

### D.1. Cấu trúc service thống kê mới

**File mới:** `frontend/src/services/thongKeService.js`

```js
import api from './api';

const thongKeService = {
  async getKho() {
    const res = await api.get('/thong-ke/kho');
    return res.data;
  },
  async getHoaDon({ from, to } = {}) {
    const res = await api.get('/thong-ke/hoa-don', { params: { from, to } });
    return res.data;
  },
  async getTaiChinh({ from, to } = {}) {
    const res = await api.get('/thong-ke/tai-chinh', { params: { from, to } });
    return res.data;
  },
  async getCanhBao() {
    const res = await api.get('/thong-ke/canh-bao');
    return res.data;
  },
};

export default thongKeService;
```

### D.2. Refactor `DashboardPage.jsx`

**File:** `frontend/src/pages/dashboard/DashboardPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Users, AlertTriangle, TrendingUp, ShoppingCart, Package, BarChart3, Bell, AlertCircle, Clock, FileText, ArrowRight, PackageX } from 'lucide-react';
import thongKeService from '../../services/thongKeService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import ExpiryBadge from '../../components/ui/ExpiryBadge';
import StockBadge from '../../components/ui/StockBadge';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [canhBao, setCanhBao] = useState({ sapHetHan: [], hetHang: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [kho, hoaDon, cb] = await Promise.all([
        thongKeService.getKho(),
        thongKeService.getHoaDon({ from: dayjs().startOf('day').toISOString(), to: dayjs().endOf('day').toISOString() }),
        thongKeService.getCanhBao().catch(() => ({ sapHetHan: [], hetHang: [] })),
      ]);
      setStats({
        tongThuoc: kho.data?.tongThuoc ?? 0,
        tonKhoThap: kho.data?.tonKhoThap ?? 0,
        khachHang: kho.data?.tongKhachHang ?? 0,
        doanhThuHomNay: hoaDon.data?.doanhThu ?? 0,
        soHoaDonHomNay: hoaDon.data?.soHoaDon ?? 0,
      });
      setCanhBao(cb.data || { sapHetHan: [], hetHang: [] });
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState label="Đang tải dashboard..." />;

  const statCards = [
    { label: 'Tổng thuốc', value: stats?.tongThuoc ?? 0, icon: <Pill />, color: 'primary', to: '/thuoc' },
    { label: 'Sắp hết hàng', value: stats?.tonKhoThap ?? 0, icon: <AlertTriangle />, color: 'warning', to: '/thuoc?filter=low-stock' },
    { label: 'Khách hàng', value: stats?.khachHang ?? 0, icon: <Users />, color: 'info', to: '/khach-hang' },
    { label: 'Doanh thu hôm nay', value: formatCurrency(stats?.doanhThuHomNay ?? 0), icon: <TrendingUp />, color: 'success', to: '/ban-hang' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero — giữ nguyên */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-card shadow-card p-6 text-white">
        ... (giữ nguyên)
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} to={s.to}><StatCard {...s} /></Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions — giữ nguyên */}

        {/* Cảnh báo — MỚI */}
        <Card
          title="Cảnh báo cần xử lý"
          subtitle={`${canhBao.sapHetHan?.length || 0} lô sắp hết hạn • ${canhBao.hetHang?.length || 0} thuốc hết hàng`}
          actions={<Link to="/kho"><Button variant="ghost" size="sm" iconRight={<ArrowRight />}>Xem kho</Button></Link>}
          className="lg:col-span-2"
        >
          {(!canhBao.sapHetHan?.length && !canhBao.hetHang?.length) ? (
            <EmptyState icon={<Bell />} title="Không có cảnh báo" description="Mọi thứ đều ổn!" />
          ) : (
            <div className="space-y-2">
              {canhBao.hetHang?.slice(0, 5).map((t) => (
                <div key={t.MaThuoc} className="flex items-center justify-between p-3 bg-danger-50 border border-danger-100 rounded-btn">
                  <div className="flex items-center gap-3">
                    <PackageX className="w-4 h-4 text-danger-600" />
                    <span className="text-body font-medium text-neutral-900">{t.TenThuoc}</span>
                  </div>
                  <StockBadge stock={0} />
                </div>
              ))}
              {canhBao.sapHetHan?.slice(0, 5).map((lo) => (
                <div key={lo.MaLo} className="flex items-center justify-between p-3 bg-warning-50 border border-warning-100 rounded-btn">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-warning-600" />
                    <div>
                      <p className="text-body font-medium text-neutral-900">{lo.TenThuoc}</p>
                      <p className="text-caption text-neutral-500">Lô #{lo.MaLo}</p>
                    </div>
                  </div>
                  <ExpiryBadge expiryDate={lo.NgayHetHan} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* System status — giữ nguyên */}
      </div>
    </div>
  );
}

export default DashboardPage;
```

**Definition of Done:**
- [ ] Mở `/dashboard` khi đã login → 4 stat card có số thật
- [ ] Nếu có thuốc sắp hết hạn / hết hàng → hiển thị block cảnh báo với icon + badge
- [ ] Loading state hiển thị trong lúc fetch

---

## 6. Phase E — Tính năng nâng cao Header/Layout (1.5 ngày)

### E.1. Notification Bell ở Header

**File sửa:** `frontend/src/components/layout/Header.jsx`

Thêm chuông + badge số cảnh báo lấy từ `canhBaoService`:

```jsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Menu, Popover } from '@headlessui/react'; // (nếu đã cài)
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import thongKeService from '../../services/thongKeService';

// Trong component Header, trước <Menu>:
const [soCanhBao, setSoCanhBao] = useState(0);
useEffect(() => {
  thongKeService.getCanhBao()
    .then((res) => {
      const cb = res.data || {};
      setSoCanhBao((cb.sapHetHan?.length || 0) + (cb.hetHang?.length || 0));
    })
    .catch(() => {});
}, []);

// Render chuông trước Menu user:
<button
  type="button"
  className="relative p-2 rounded-btn text-neutral-600 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  aria-label={`${soCanhBao} cảnh báo`}
>
  <Bell className="w-5 h-5" />
  {soCanhBao > 0 && (
    <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-danger-600 text-white text-caption flex items-center justify-center font-semibold">
      {soCanhBao > 9 ? '9+' : soCanhBao}
    </span>
  )}
</button>
```

### E.2. Global search ở Header

**File sửa:** `frontend/src/components/layout/Header.jsx`

```jsx
import { Search } from 'lucide-react';

const [searchInput, setSearchInput] = useState('');

const handleGlobalSearch = (e) => {
  e.preventDefault();
  if (searchInput.trim()) navigate(`/thuoc?keyword=${encodeURIComponent(searchInput.trim())}`);
};

// Render giữa header, ẩn trên mobile:
<form onSubmit={handleGlobalSearch} className="hidden md:flex flex-1 max-w-md mx-4">
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
    <input
      type="text"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Tìm thuốc, khách hàng..."
      className="w-full h-9 pl-10 pr-3 text-body border border-neutral-300 rounded-btn focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
    />
  </div>
</form>
```

> Trang `/thuoc?keyword=...` cần update `ThuocListPage` để đọc `keyword` từ URL `useSearchParams` (xem E.3).

### E.3. Đọc query string trong `ThuocListPage`

**File sửa:** `frontend/src/pages/thuoc/ThuocListPage.jsx`

```jsx
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();
const initialKeyword = searchParams.get('keyword') || '';

const [searchInput, setSearchInput] = useState(initialKeyword);
const [filters, setFilters] = useState({ keyword: initialKeyword, maDM: '' });

useEffect(() => {
  fetchData(1);
}, [filters.keyword, filters.maDM]);

// Khi search xong, sync URL:
const setSearchAndUrl = (v) => {
  setSearchInput(v);
  const next = new URLSearchParams(searchParams);
  if (v) next.set('keyword', v); else next.delete('keyword');
  setSearchParams(next, { replace: true });
};
```

---

## 7. Phase F — Animation + Dark mode (tùy chọn)

### F.1. Animation subtle cho row mount

**File sửa:** `frontend/src/components/ui/Table.jsx`

Wrap mỗi `<tr>` với CSS transition opacity:

```jsx
<tbody className="divide-y divide-neutral-200">
  {data.map((row, i) => (
    <tr
      key={row[rowKey]}
      style={{ animation: `fadeInUp 0.2s ease-out ${i * 20}ms both` }}
      className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-neutral-50')}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
    >
      ...
    </tr>
  ))}
</tbody>
```

Thêm vào `tailwind.config.js` → `theme.extend.keyframes.fadeInUp` tương tự `fadeIn`.

### F.2. Dark mode (chỉ làm khi còn thời gian)

Phải thêm variant `dark:` cho từng class color → tốn nhiều công. **Khuyến nghị BỎ QUA** cho đồ án này, ghi nhận là "future work".

---

## 8. Checklist tổng kết + Definition of Done

### Tracking

| Phase | Trạng thái | Đã làm | File chính đã sửa |
|---|:-:|:-:|---|
| **A** — Sửa lỗi cao | ⬜ | ☐ A.1, ☐ A.2, ☐ A.3 | `NhanVienPage.jsx`, `KhachHangPage.jsx`, `DanhMucPage.jsx`, `ThuocDetailPage.jsx` |
| **B** — Component chung | ⬜ | ☐ B.1, ☐ B.2, ☐ B.3, ☐ B.4 | `Pagination.jsx`, mới `Breadcrumb.jsx`, `EmptyState.jsx`, mới `useFormField.js` |
| **C** — Polish CRUD | ⬜ | ☐ C.1, ☐ C.2, ☐ C.3 | `Button.jsx` + 5 page CRUD |
| **D** — Dashboard thật | ⬜ | ☐ D.1, ☐ D.2 | mới `thongKeService.js`, `DashboardPage.jsx` |
| **E** — Header nâng cao | ⬜ | ☐ E.1, ☐ E.2, ☐ E.3 | `Header.jsx`, `ThuocListPage.jsx` |
| **F** — Animation/Dark | ⬜ | ☐ F.1, ☐ F.2 | (tuỳ chọn) |

### Definition of Done cho TOÀN BỘ plan

- [ ] Tất cả file `.jsx` không có icon import thừa (`rg "import.*lucide"` đối chiếu usage)
- [ ] Không còn `window.confirm`, không hardcode color, không dynamic Tailwind JIT
- [ ] Mở app ở 3 kích thước: mobile 375px, tablet 768px, desktop 1280px — không vỡ layout
- [ ] Tab navigation hoạt động đầy đủ ở mọi page (test: bấm `Tab` 10 lần từ logo → không bị "kẹt")
- [ ] Toast / modal / pagination đều focus ring rõ
- [ ] Dashboard hiển thị số thật (không còn "—")
- [ ] Update `docs/UI_DESIGN_SYSTEM.md` nếu thêm component mới (Breadcrumb, EmptyResults…)
- [ ] Update `frontend/src/utils/constants.js` nếu thêm role/menu
- [ ] Ảnh chụp trước/sau cho mỗi page đã sửa (đưa vào báo cáo)

### Công cụ kiểm tra nhanh

```bash
# 1. Không còn hardcode color
rg "bg-(green|red|blue|yellow|gray)-(50|100|500|700)" frontend/src/

# 2. Không còn window.confirm
rg "window\.confirm" frontend/src/

# 3. Không còn dynamic Tailwind class
rg "bg-\$\{" frontend/src/

# 4. Không còn toLocaleDateString rải rác
rg "toLocaleDateString" frontend/src/

# 5. ESLint clean
cd frontend && npm run lint
```

### Ước lượng tổng

| Phase | Effort |
|---|---|
| A | 0.5 ngày |
| B | 1.0 ngày |
| C | 1.5 ngày |
| D | 0.5 ngày (nếu backend sẵn endpoint) hoặc 2-3 ngày (tự mock trước) |
| E | 1.5 ngày |
| F | (optional) 0.5–1 ngày |
| **Tổng** | **~5 ngày làm việc (1 tuần)** |

---

## 📞 Liên hệ

Nếu trong lúc code phát sinh câu hỏi:
- Design token/pattern → `docs/UI_DESIGN_SYSTEM.md`
- Anti-pattern cần tránh → `docs/UI_DESIGN_SYSTEM.md` mục 10
- Lỗi này chưa có trong plan → check `docs/UI_REVIEW.md` ID tương ứng

> 🎓 *"Một page được polish 10 lần sẽ đẹp hơn 10 page được code 1 lần."*
