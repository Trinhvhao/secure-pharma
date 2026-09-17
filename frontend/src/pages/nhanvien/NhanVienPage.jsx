/**
 * NhanVienPage - Quản lý nhân viên (Admin only)
 *
 * Nâng cấp UI tương tự KhachHangPage / NhaCungCapPage:
 *  • Stats: Tổng NV, Đang làm, Có tài khoản, Mới 30 ngày
 *  • VaiTro badges: Admin / Bán hàng / Kho
 *  • TrangThai badges: Đang làm / Nghỉ việc
 *  • Filter: keyword + vaiTro + trangThai
 *  • Table nâng cấp: avatar, tên + mã + vai trò, SĐT, giới tính, lương,
 *                    số HĐ, số phiếu nhập, ngày vào
 *  • Modal chi tiết: profile + stats tích lũy + lịch sử hóa đơn
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    UserCog, Plus, Edit2, Trash2, Users, Eye, Phone, Calendar,
    ShoppingCart, Package, Wallet, ShieldCheck, X,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import nhanVienService from '../../services/nhanVienService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import SearchBar from '../../components/ui/SearchBar';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// ─── Vai trò helpers ───────────────────────────────────────────────────────────

const ROLE_VARIANT = {
    Admin:      'warning',
    NV_BanHang: 'info',
    NV_Kho:     'success',
    default:    'neutral',
};

const ROLE_LABEL = {
    Admin:      'Quản lý',
    NV_BanHang: 'Bán hàng',
    NV_Kho:     'Thủ kho',
    default:    '—',
};

const STATUS_VARIANT = {
    DangLam:  'success',
    NghiViec: 'neutral',
};

const STATUS_LABEL = {
    DangLam:  'Đang làm',
    NghiViec: 'Nghỉ việc',
};

const PN_STATUS_VARIANT = {
    DaNhap:   'success',
    ChoDuyet: 'warning',
    Huy:      'danger',
};

const PN_STATUS_LABEL = {
    DaNhap:   'Đã nhập',
    ChoDuyet: 'Chờ duyệt',
    Huy:      'Đã hủy',
};

// ─── Avatar ────────────────────────────────────────────────────────────────────

function EmployeeAvatar({ name, role }) {
    const initial = name ? name.trim()[0].toUpperCase() : '?';
    // Hue range: Admin (orange/red), Bán hàng (cyan), Kho (green)
    const hue = role === 'Admin' ? 0
              : role === 'NV_BanHang' ? 200
              : role === 'NV_Kho' ? 140
              : (name ? (name.charCodeAt(0) * 37) % 360 : 30);
    return (
        <span
            className="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-white flex-shrink-0 select-none text-body"
            style={{ backgroundColor: `hsl(${hue}, 55%, 50%)` }}
            aria-hidden="true"
        >
            {initial}
        </span>
    );
}

// ─── Stat mini ────────────────────────────────────────────────────────────────

const STAT_MINI_COLOR = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    danger:  'text-danger-600 bg-danger-50',
    info:    'text-info-600 bg-info-50',
    neutral: 'text-neutral-600 bg-neutral-100',
};

function StatMini({ label, value, color = 'primary' }) {
    return (
        <div className={cn('rounded-card p-3 text-center', STAT_MINI_COLOR[color])}>
            <p className="text-caption opacity-80 mb-1">{label}</p>
            <p className="text-h3 font-bold font-mono truncate">{value}</p>
        </div>
    );
}

// ─── Employee Detail Modal ────────────────────────────────────────────────────

function EmployeeDetailModal({ nv, hoaDon = [], phieuNhap = [], loadingHD = false, loadingPN = false, onClose, onEdit }) {
    if (!nv) return null;

    const soHoaDon = Number(nv.SoHoaDon) || 0;
    const tongBan = Number(nv.TongBan) || 0;
    const soPhieuNhap = Number(nv.SoPhieuNhap) || 0;
    const tongNhap = Number(nv.TongNhap) || 0;
    const soPhieuChi = Number(nv.SoPhieuChi) || 0;
    const tongChi = Number(nv.TongChi) || 0;

    return (
        <Modal open={!!nv} onClose={onClose} size="xl" title="Chi tiết nhân viên">
            <div className="space-y-6">
                {/* Header row */}
                <div className="flex items-start gap-4">
                    <EmployeeAvatar name={nv.TenNV} role={nv.VaiTro} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-h2 text-neutral-900 truncate">{nv.TenNV}</h2>
                            <Badge variant={STATUS_VARIANT[nv.TrangThai] || 'neutral'} dot>
                                {STATUS_LABEL[nv.TrangThai] || nv.TrangThai || '—'}
                            </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-neutral-500">
                            {nv.VaiTro && (
                                <Badge variant={ROLE_VARIANT[nv.VaiTro] || 'neutral'} size="sm">
                                    {ROLE_LABEL[nv.VaiTro] || nv.VaiTro}
                                </Badge>
                            )}
                            {nv.TenDangNhap && (
                                <span className="flex items-center gap-1 font-mono">
                                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                    @{nv.TenDangNhap}
                                </span>
                            )}
                            {nv.SDT && (
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                                    {nv.SDT}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                {nv.NgayVaoLam
                                    ? `Vào làm ${dayjs(nv.NgayVaoLam).format('DD/MM/YYYY')} (${dayjs(nv.NgayVaoLam).fromNow()})`
                                    : '—'}
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit2 className="w-4 h-4" />}
                        onClick={() => { onClose(); onEdit(nv); }}
                    >
                        Sửa
                    </Button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatMini
                        label="Số hóa đơn"
                        value={soHoaDon.toLocaleString('vi-VN')}
                        color={soHoaDon > 0 ? 'success' : 'neutral'}
                    />
                    <StatMini
                        label="Tổng bán"
                        value={formatCurrency(tongBan)}
                        color="primary"
                    />
                    <StatMini
                        label="Số phiếu nhập"
                        value={soPhieuNhap.toLocaleString('vi-VN')}
                        color="info"
                    />
                    <StatMini
                        label="Lương"
                        value={formatCurrency(Number(nv.Luong) || 0)}
                        color="warning"
                    />
                </div>

                {/* Sub stats: phiếu chi */}
                {soPhieuChi > 0 && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-card">
                        <div className="text-center">
                            <p className="text-caption text-neutral-500 mb-0.5">Phiếu chi đã lập</p>
                            <p className="text-h3 font-bold text-neutral-900 font-mono">
                                {soPhieuChi.toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-caption text-neutral-500 mb-0.5">Tổng tiền đã chi</p>
                            <p className="text-h3 font-bold text-primary-700 font-mono">
                                {formatCurrency(tongChi)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Order history */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-body font-semibold text-neutral-800">Hóa đơn đã thanh toán</h3>
                        <span className="text-caption text-neutral-500">{hoaDon.length} hóa đơn gần nhất</span>
                    </div>

                    {loadingHD ? (
                        <div className="text-center py-8 text-neutral-400 text-body">Đang tải hóa đơn...</div>
                    ) : hoaDon.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-10 h-10 mx-auto text-neutral-200 mb-2" />
                            <p className="text-body text-neutral-500">Chưa lập hóa đơn nào</p>
                        </div>
                    ) : (
                        <div className="border border-neutral-200 rounded-card overflow-hidden">
                            <table className="w-full text-body">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Mã HĐ</th>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Thời gian</th>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Khách hàng</th>
                                        <th className="px-4 py-2 text-center text-caption font-semibold text-neutral-600">Mặt hàng</th>
                                        <th className="px-4 py-2 text-center text-caption font-semibold text-neutral-600">SL</th>
                                        <th className="px-4 py-2 text-right text-caption font-semibold text-neutral-600">Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {hoaDon.map((hd) => (
                                        <tr key={hd.MaHD} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <span className="font-mono text-neutral-500">#{hd.MaHD}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-neutral-700">
                                                {dayjs(hd.NgayGioLap).format('DD/MM/YYYY HH:mm')}
                                            </td>
                                            <td className="px-4 py-2.5 text-neutral-700">{hd.TenKH || 'Khách lẻ'}</td>
                                            <td className="px-4 py-2.5 text-center text-neutral-700">{hd.SoMatHang}</td>
                                            <td className="px-4 py-2.5 text-center text-neutral-700">
                                                {hd.TongSoLuong.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-neutral-900">
                                                {formatCurrency(hd.TongTien)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Phiếu nhập history */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-body font-semibold text-neutral-800">Phiếu nhập đã lập</h3>
                        <span className="text-caption text-neutral-500">{phieuNhap.length} phiếu gần nhất</span>
                    </div>

                    {loadingPN ? (
                        <div className="text-center py-8 text-neutral-400 text-body">Đang tải phiếu nhập...</div>
                    ) : phieuNhap.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="w-10 h-10 mx-auto text-neutral-200 mb-2" />
                            <p className="text-body text-neutral-500">Chưa lập phiếu nhập nào</p>
                        </div>
                    ) : (
                        <div className="border border-neutral-200 rounded-card overflow-hidden">
                            <table className="w-full text-body">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Mã PN</th>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Ngày nhập</th>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Nhà cung cấp</th>
                                        <th className="px-4 py-2 text-center text-caption font-semibold text-neutral-600">Số lô</th>
                                        <th className="px-4 py-2 text-center text-caption font-semibold text-neutral-600">SL</th>
                                        <th className="px-4 py-2 text-left text-caption font-semibold text-neutral-600">Trạng thái</th>
                                        <th className="px-4 py-2 text-right text-caption font-semibold text-neutral-600">Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {phieuNhap.map((pn) => (
                                        <tr key={pn.MaPN} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <span className="font-mono text-neutral-500">#{pn.MaPN}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-neutral-700">
                                                {dayjs(pn.NgayNhap).format('DD/MM/YYYY HH:mm')}
                                            </td>
                                            <td className="px-4 py-2.5 text-neutral-700">{pn.TenNCC || '—'}</td>
                                            <td className="px-4 py-2.5 text-center text-neutral-700">{pn.SoLo}</td>
                                            <td className="px-4 py-2.5 text-center text-neutral-700">
                                                {pn.TongSoLuong.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <Badge variant={PN_STATUS_VARIANT[pn.TrangThai] || 'neutral'} size="sm" dot>
                                                    {PN_STATUS_LABEL[pn.TrangThai] || pn.TrangThai || '—'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-neutral-900">
                                                {formatCurrency(pn.TongTien)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function NhanVienPage() {
    // ── Stats ───────────────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // ── Table data ──────────────────────────────────────────────────────────
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0,
    });
    const [loading, setLoading] = useState(false);

    // ── Filters ─────────────────────────────────────────────────────────────
    const [keyword, setKeyword] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [vaiTro, setVaiTro] = useState('');
    const [trangThai, setTrangThai] = useState('');

    // ── Modal: create / edit ────────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        tenNV: '', sdt: '', gioiTinh: '', luong: 0, ngayVaoLam: '', trangThai: 'DangLam',
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Modal: detail ───────────────────────────────────────────────────────
    const [detailNV, setDetailNV] = useState(null);
    const [hoaDon, setHoaDon] = useState([]);
    const [hoaDonLoading, setHoaDonLoading] = useState(false);
    const [phieuNhap, setPhieuNhap] = useState([]);
    const [phieuNhapLoading, setPhieuNhapLoading] = useState(false);

    // ── Confirm delete ──────────────────────────────────────────────────────
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ── Debounce search ─────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setKeyword(keywordInput), 400);
        return () => clearTimeout(t);
    }, [keywordInput]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await nhanVienService.getStats();
            setStats(res.data);
        } catch {
            // non-critical
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchData = useCallback(async (page = pagination.page) => {
        setLoading(true);
        try {
            const res = await nhanVienService.getAll({
                keyword, vaiTro, trangThai,
                page, limit: DEFAULT_PAGE_SIZE,
            });
            setItems(res.data?.items || []);
            setPagination(
                res.data?.pagination || { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 }
            );
        } catch {
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }, [keyword, vaiTro, trangThai, pagination.page]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    useEffect(() => {
        fetchData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, vaiTro, trangThai]);

    // ── Modal: create / edit handlers ──────────────────────────────────────
    const openCreate = () => {
        setEditing(null);
        setFormError('');
        setFormData({
            tenNV: '', sdt: '', gioiTinh: '', luong: 0,
            ngayVaoLam: new Date().toISOString().split('T')[0], trangThai: 'DangLam',
        });
        setModalOpen(true);
    };

    const openEdit = (it) => {
        setEditing(it);
        setFormError('');
        setFormData({
            tenNV: it.TenNV,
            sdt: it.SDT || '',
            gioiTinh: it.GioiTinh || '',
            luong: it.Luong || 0,
            ngayVaoLam: it.NgayVaoLam ? new Date(it.NgayVaoLam).toISOString().split('T')[0] : '',
            trangThai: it.TrangThai || 'DangLam',
        });
        setModalOpen(true);
    };

    // ── Modal: detail ───────────────────────────────────────────────────────
    const openDetail = useCallback(async (it) => {
        setDetailNV({ ...it });
        setHoaDon([]);
        setHoaDonLoading(true);
        setPhieuNhap([]);
        setPhieuNhapLoading(true);
        try {
            const [detailRes, hdRes, pnRes] = await Promise.all([
                nhanVienService.getById(it.MaNV),
                nhanVienService.getHoaDonByNV(it.MaNV, 10),
                nhanVienService.getPhieuNhapByNV(it.MaNV, 10),
            ]);
            setDetailNV(detailRes.data);
            setHoaDon(hdRes.data || []);
            setPhieuNhap(pnRes.data || []);
        } catch {
            toast.error('Không thể tải chi tiết nhân viên');
        } finally {
            setHoaDonLoading(false);
            setPhieuNhapLoading(false);
        }
    }, []);

    // ── Submit form ─────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.tenNV.trim()) {
            setFormError('Vui lòng nhập tên nhân viên');
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await nhanVienService.update(editing.MaNV, formData);
                toast.success('Cập nhật thành công');
            } else {
                await nhanVienService.create(formData);
                toast.success('Tạo nhân viên thành công');
            }
            setModalOpen(false);
            fetchData(pagination.page);
            fetchStats();
        } catch (err) {
            const msg = err.response?.data?.error?.message || 'Thao tác thất bại';
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await nhanVienService.remove(confirmDeleteId);
            toast.success('Xóa thành công');
            setConfirmDeleteId(null);
            fetchData(pagination.page);
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Không thể xóa');
        } finally {
            setDeleting(false);
        }
    };

    const hasActiveFilters = Boolean(keyword || vaiTro || trangThai);
    const deletingItem = items.find((i) => i.MaNV === confirmDeleteId);

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = [
        {
            key: 'avatar',
            label: '',
            width: '40px',
            render: (it) => <EmployeeAvatar name={it.TenNV} role={it.VaiTro} />,
        },
        {
            key: 'name',
            label: 'Nhân viên',
            render: (it) => (
                <div className="flex items-center gap-2 min-w-0">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-neutral-900 truncate">{it.TenNV}</span>
                            <Badge variant={ROLE_VARIANT[it.VaiTro] || 'neutral'} size="sm">
                                {ROLE_LABEL[it.VaiTro] || it.VaiTro || 'Chưa có TK'}
                            </Badge>
                            <Badge variant={STATUS_VARIANT[it.TrangThai] || 'neutral'} size="sm">
                                {STATUS_LABEL[it.TrangThai] || it.TrangThai || '—'}
                            </Badge>
                        </div>
                        <div className="text-caption text-neutral-500 flex items-center gap-2 flex-wrap">
                            <span className="font-mono">#{it.MaNV}</span>
                            {it.GioiTinh && <span>• {it.GioiTinh}</span>}
                            {it.TenDangNhap && (
                                <span className="font-mono">• @{it.TenDangNhap}</span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'sdt',
            label: 'SĐT',
            render: (it) => (
                <span className="flex items-center gap-1 text-neutral-700">
                    {it.SDT ? (
                        <>
                            <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                            {it.SDT}
                        </>
                    ) : (
                        <span className="text-neutral-400">—</span>
                    )}
                </span>
            ),
        },
        {
            key: 'soHoaDon',
            label: 'Số HĐ',
            align: 'center',
            width: '80px',
            render: (it) => (
                <span className={cn(
                    'font-semibold font-mono',
                    it.SoHoaDon > 0 ? 'text-primary-700' : 'text-neutral-400'
                )}>
                    {it.SoHoaDon > 0 ? it.SoHoaDon : '—'}
                </span>
            ),
        },
        {
            key: 'soPhieuNhap',
            label: 'Số PN',
            align: 'center',
            width: '80px',
            render: (it) => (
                <span className={cn(
                    'font-semibold font-mono',
                    it.SoPhieuNhap > 0 ? 'text-info-700' : 'text-neutral-400'
                )}>
                    {it.SoPhieuNhap > 0 ? it.SoPhieuNhap : '—'}
                </span>
            ),
        },
        {
            key: 'luong',
            label: 'Lương',
            align: 'right',
            width: '120px',
            render: (it) => (
                <span className="font-mono font-medium text-warning-700">
                    {it.Luong ? formatCurrency(it.Luong) : '—'}
                </span>
            ),
        },
        {
            key: 'joined',
            label: 'Ngày vào',
            width: '120px',
            render: (it) => (
                <span className="text-neutral-500">
                    {it.NgayVaoLam ? new Date(it.NgayVaoLam).toLocaleDateString('vi-VN') : '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '110px',
            render: (it) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openDetail(it); }}
                        className="p-1.5 rounded-btn text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        title="Xem chi tiết"
                        aria-label={`Xem chi tiết ${it.TenNV}`}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEdit(it); }}
                        className="p-1.5 rounded-btn text-info-600 hover:bg-info-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        title="Sửa"
                        aria-label={`Sửa ${it.TenNV}`}
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(it.MaNV); }}
                        className="p-1.5 rounded-btn text-danger-600 hover:bg-danger-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        title="Xóa"
                        aria-label={`Xóa ${it.TenNV}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* ── Page header ─────────────────────────────────────────────────── */}
            <PageHeader
                icon={<UserCog />}
                title="Nhân viên"
                subtitle="Quản lý nhân viên, tài khoản và hoạt động bán/nhập"
                actions={
                    <Button variant="primary" icon={<Plus />} onClick={openCreate}>
                        Thêm nhân viên
                    </Button>
                }
            />

            {/* ── Stats row ─────────────────────────────────────────────────── */}
            <section
                aria-label="Thống kê nhân viên"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                <StatCard
                    icon={<Users className="h-5 w-5" />}
                    label="Tổng nhân viên"
                    value={statsLoading ? '—' : (stats?.tongNhanVien ?? 0).toLocaleString('vi-VN')}
                    color="primary"
                />
                <StatCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Đang làm việc"
                    value={statsLoading ? '—' : (stats?.dangLam ?? 0).toLocaleString('vi-VN')}
                    color="success"
                />
                <StatCard
                    icon={<UserCog className="h-5 w-5" />}
                    label="Có tài khoản"
                    value={statsLoading ? '—' : (stats?.coTaiKhoan ?? 0).toLocaleString('vi-VN')}
                    color="info"
                />
                <StatCard
                    icon={<Calendar className="h-5 w-5" />}
                    label="Mới (30 ngày)"
                    value={statsLoading ? '—' : (stats?.moi30Ngay ?? 0).toLocaleString('vi-VN')}
                    color="warning"
                />
            </section>

            {/* ── Filter toolbar ─────────────────────────────────────────────── */}
            <SearchBar
                value={keywordInput}
                onChange={setKeywordInput}
                placeholder="Tìm theo tên, số điện thoại..."
                title="Tìm kiếm và lọc"
                description="Lọc nhân viên theo từ khóa, vai trò hoặc trạng thái."
                meta={loading ? 'Đang cập nhật...' : `${pagination.total} kết quả`}
            >
                {/* Vai trò filter */}
                <Select
                    label="Vai trò"
                    value={vaiTro}
                    onChange={(v) => setVaiTro(v)}
                    options={[
                        { value: '', label: 'Tất cả vai trò' },
                        { value: 'Admin', label: '👑 Quản lý' },
                        { value: 'NV_BanHang', label: '🛒 Bán hàng' },
                        { value: 'NV_Kho', label: '📦 Thủ kho' },
                    ]}
                    placeholder="Vai trò"
                    className="w-full sm:w-[150px]"
                    selectClassName="h-10"
                    aria-label="Lọc theo vai trò"
                />

                {/* Trạng thái filter */}
                <Select
                    label="Trạng thái"
                    value={trangThai}
                    onChange={(v) => setTrangThai(v)}
                    options={[
                        { value: '', label: 'Tất cả trạng thái' },
                        { value: 'DangLam', label: '✓ Đang làm' },
                        { value: 'NghiViec', label: '✕ Nghỉ việc' },
                    ]}
                    placeholder="Trạng thái"
                    className="w-full sm:w-[150px]"
                    selectClassName="h-10"
                    aria-label="Lọc theo trạng thái"
                />

                {hasActiveFilters && (
                    <Button
                        variant="secondary"
                        size="lg"
                        icon={<X className="h-4 w-4" />}
                        onClick={() => {
                            setKeywordInput('');
                            setKeyword('');
                            setVaiTro('');
                            setTrangThai('');
                        }}
                        title="Xóa bộ lọc"
                        className="w-full sm:w-auto"
                    >
                        Xóa lọc
                    </Button>
                )}
            </SearchBar>

            {/* ── Vai trò / giới tính legend ─────────────────────────────────── */}
            {stats && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption">
                    <span className="text-neutral-500">Vai trò:</span>
                    {[
                        { key: 'Admin', label: '👑 Quản lý', variant: 'warning' },
                        { key: 'NV_BanHang', label: '🛒 Bán hàng', variant: 'info' },
                        { key: 'NV_Kho', label: '📦 Thủ kho', variant: 'success' },
                    ].map(({ key, label, variant }) => (
                        <Badge key={key} variant={variant} size="sm" dot>
                            {label}{' '}
                            <span className="font-mono font-bold text-neutral-700">
                                {stats.vaiTro?.[key] ?? 0}
                            </span>
                        </Badge>
                    ))}
                    <span className="text-neutral-300">|</span>
                    <span className="text-neutral-500">Giới tính:</span>
                    <Badge variant="info" size="sm" dot>
                        Nam <span className="font-mono font-bold text-neutral-700">{stats.gioiTinh?.Nam ?? 0}</span>
                    </Badge>
                    <Badge variant="success" size="sm" dot>
                        Nữ <span className="font-mono font-bold text-neutral-700">{stats.gioiTinh?.Nu ?? 0}</span>
                    </Badge>
                </div>
            )}

            {/* ── Table ──────────────────────────────────────────────────────── */}
            <Table
                columns={columns}
                data={items}
                loading={loading}
                rowKey="MaNV"
                emptyTitle={
                    hasActiveFilters
                        ? 'Không tìm thấy nhân viên phù hợp'
                        : 'Chưa có nhân viên nào'
                }
                emptyDescription={
                    hasActiveFilters
                        ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                        : 'Thêm nhân viên đầu tiên để bắt đầu quản lý đội ngũ.'
                }
                emptyIcon={<Users />}
                emptyAction={
                    hasActiveFilters ? (
                        <Button
                            variant="secondary"
                            icon={<X className="h-4 w-4" />}
                            onClick={() => {
                                setKeywordInput('');
                                setKeyword('');
                                setVaiTro('');
                                setTrangThai('');
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    ) : undefined
                }
                onRowClick={openDetail}
            />

            {/* ── Pagination ────────────────────────────────────────────────── */}
            <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onChange={(p) => fetchData(p)}
                loading={loading}
            />

            {/* ── Modal: Create / Edit ──────────────────────────────────────── */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Sửa nhân viên' : 'Thêm nhân viên'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Tên nhân viên"
                        required
                        value={formData.tenNV}
                        onChange={(e) => setFormData({ ...formData, tenNV: e.target.value })}
                        maxLength={200}
                        placeholder="VD: Nguyễn Văn An"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Số điện thoại"
                            value={formData.sdt}
                            onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                            placeholder="VD: 0912345678"
                        />
                        <Select
                            label="Giới tính"
                            value={formData.gioiTinh}
                            onChange={(v) => setFormData({ ...formData, gioiTinh: v })}
                            options={[
                                { value: '', label: '—' },
                                { value: 'Nam', label: 'Nam' },
                                { value: 'Nữ', label: 'Nữ' },
                                { value: 'Khác', label: 'Khác' },
                            ]}
                            placeholder="—"
                        />
                        <Input
                            label="Lương"
                            type="number"
                            min="0"
                            step="100000"
                            value={formData.luong}
                            onChange={(e) => setFormData({ ...formData, luong: Number(e.target.value) })}
                            hint="VND"
                        />
                        <Input
                            label="Ngày vào làm"
                            type="date"
                            value={formData.ngayVaoLam}
                            onChange={(e) => setFormData({ ...formData, ngayVaoLam: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Trạng thái"
                        value={formData.trangThai}
                        onChange={(v) => setFormData({ ...formData, trangThai: v })}
                        options={[
                            { value: 'DangLam', label: 'Đang làm' },
                            { value: 'NghiViec', label: 'Nghỉ việc' },
                        ]}
                    />

                    {formError && (
                        <div className="p-3 bg-danger-50 border border-danger-100 rounded-btn text-caption text-danger-700">
                            {formError}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                            disabled={submitting}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" loading={submitting}>
                            {editing ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: Detail ──────────────────────────────────────────────── */}
            <EmployeeDetailModal
                nv={detailNV}
                hoaDon={hoaDon}
                loadingHD={hoaDonLoading}
                phieuNhap={phieuNhap}
                loadingPN={phieuNhapLoading}
                onClose={() => setDetailNV(null)}
                onEdit={openEdit}
            />

            {/* ── Confirm delete ─────────────────────────────────────────────── */}
            <ConfirmDialog
                open={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Xóa nhân viên"
                message={
                    deletingItem
                        ? `Bạn có chắc chắn muốn xóa nhân viên "${deletingItem.TenNV}"? Hành động này không thể hoàn tác.`
                        : ''
                }
                confirmLabel="Xóa"
            />
        </div>
    );
}

export default NhanVienPage;
