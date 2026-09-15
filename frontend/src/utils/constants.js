/**
 * Constants used across the app
 */

// User roles
export const ROLES = {
    ADMIN: 'Admin',
    NV_BANHANG: 'NV_BanHang'
};

export const ROLE_LABELS = {
    Admin: 'Quản lý',
    NV_BanHang: 'Nhân viên bán hàng'
};

// Menu items by role
export const MENU_ITEMS = [
    {
        key: 'dashboard',
        label: 'Trang chủ',
        icon: 'Home',
        path: '/dashboard',
        roles: ['Admin', 'NV_BanHang']
    },
    {
        key: 'banhang',
        label: 'Bán thuốc',
        icon: 'ShoppingCart',
        path: '/ban-hang',
        roles: ['Admin', 'NV_BanHang']
    },
    {
        key: 'thuoc',
        label: 'Quản lý thuốc',
        icon: 'Pill',
        path: '/thuoc',
        roles: ['Admin', 'NV_BanHang']
    },
    {
        key: 'kho',
        label: 'Quản lý kho',
        icon: 'Warehouse',
        path: '/kho',
        roles: ['Admin', 'NV_BanHang']
    },
    {
        key: 'khachhang',
        label: 'Khách hàng',
        icon: 'Users',
        path: '/khach-hang',
        roles: ['Admin', 'NV_BanHang']
    },
    {
        key: 'nhacungcap',
        label: 'Nhà cung cấp',
        icon: 'Truck',
        path: '/nha-cung-cap',
        roles: ['Admin', 'NV_BanHang']
    },
    {
        key: 'nhanvien',
        label: 'Nhân viên',
        icon: 'UserCog',
        path: '/nhan-vien',
        roles: ['Admin']
    },
    {
        key: 'taichinh',
        label: 'Tài chính',
        icon: 'Wallet',
        path: '/tai-chinh',
        roles: ['Admin']
    },
    {
        key: 'thongke',
        label: 'Thống kê',
        icon: 'BarChart',
        path: '/thong-ke',
        roles: ['Admin', 'NV_BanHang']
    }
];

// Currency format
export const CURRENCY = '₫';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
