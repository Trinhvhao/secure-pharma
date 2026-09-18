/**
 * AuditLogPage — Nhat ky hanh dong he thong (Admin only)
 *
 * Tinh nang:
 *  - Thong ke tong quan: Tong so ban ghi, so nguoi dung, so loai hanh dong (7 ngay)
 *  - Bang: Loc theo ngay, nguoi dung, action, bang
 *  - Chi tiet: Click dong de xem OldValue/NewValue
 *  - Phan trang
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    ScrollText, Search, Filter, Eye, ChevronDown, ChevronUp,
    Activity, Users, ListChecks, Calendar, X, RefreshCw,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import auditLogService from '../../services/auditLogService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';

dayjs.locale('vi');

// Action type → badge color
const ACTION_VARIANT = (action) => {
    if (!action) return 'default';
    if (action.startsWith('LOGIN') || action.startsWith('LOGOUT')) return 'info';
    if (action.startsWith('CREATE') || action === 'SEED') return 'success';
    if (action.startsWith('UPDATE') || action === 'UPDATE_ACCOUNT_NV') return 'warning';
    if (action.startsWith('DELETE') || action === 'CANCEL_HOADON') return 'danger';
    if (action.startsWith('RESET')) return 'warning';
    if (action.startsWith('APPROVE')) return 'success';
    if (action.startsWith('REJECT')) return 'danger';
    return 'default';
};

// ACTION label tiếng Việt
const ACTION_LABEL = (action) => {
    if (!action) return action;
    const map = {
        LOGIN: 'Đăng nhập',
        LOGOUT: 'Đăng xuất',
        CHANGE_PASSWORD: 'Đổi mật khẩu',
        SEED: 'Khởi tạo hệ thống',
        CREATE_NV: 'Tạo nhân viên',
        UPDATE_NV: 'Cập nhật nhân viên',
        DELETE_NV: 'Xóa nhân viên',
        CREATE_ACCOUNT_NV: 'Tạo tài khoản',
        UPDATE_ACCOUNT_NV: 'Cập nhật tài khoản',
        RESET_PASSWORD_NV: 'Reset mật khẩu',
        CREATE_DANHMUC: 'Tạo danh mục',
        UPDATE_DANHMUC: 'Cập nhật danh mục',
        DELETE_DANHMUC: 'Xóa danh mục',
        CREATE_THUOC: 'Tạo thuốc',
        UPDATE_THUOC: 'Cập nhật thuốc',
        DELETE_THUOC: 'Xóa thuốc',
        CREATE_NCC: 'Tạo nhà cung cấp',
        UPDATE_NCC: 'Cập nhật nhà cung cấp',
        DELETE_NCC: 'Xóa nhà cung cấp',
        CREATE_KH: 'Tạo khách hàng',
        UPDATE_KH: 'Cập nhật khách hàng',
        DELETE_KH: 'Xóa khách hàng',
        CREATE_PHIEUNHAP: 'Tạo phiếu nhập',
        UPDATE_PHIEUNHAP: 'Cập nhật phiếu nhập',
        APPROVE_PHIEUNHAP: 'Duyệt phiếu nhập',
        REJECT_PHIEUNHAP: 'Từ chối phiếu nhập',
        CREATE_HOADON: 'Tạo hóa đơn',
        CANCEL_HOADON: 'Hủy hóa đơn',
        CREATE_PHIEUTHU: 'Tạo phiếu thu',
        CREATE_PHIEUCHI: 'Tạo phiếu chi',
        CREATE_DIEU_CHINH: 'Tạo điều chỉnh kho',
        APPROVE_DIEU_CHINH: 'Duyệt điều chỉnh kho',
        REJECT_DIEU_CHINH: 'Từ chối điều chỉnh kho',
    };
    return map[action] || action.replace(/_/g, ' ');
};

function formatJson(val) {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try {
        return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
        return val;
    }
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [actions, setActions] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        tenDangNhap: '',
        action: '',
        tableName: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Detail modal
    const [detailLog, setDetailLog] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Load stats + filter dropdowns
    const loadMeta = useCallback(async () => {
        try {
            const [statsRes, actionsRes, tablesRes] = await Promise.all([
                auditLogService.getStats(),
                auditLogService.getActionTypes(),
                auditLogService.getTableNames(),
            ]);
            setStats(statsRes.data?.data);
            setActions(actionsRes.data?.data || []);
            setTables(tablesRes.data?.data || []);
        } catch (e) {
            console.error('Load meta error:', e);
        }
    }, []);

    // Load logs
    const loadLogs = useCallback(async (f = filters, p = page) => {
        setLoading(true);
        try {
            const res = await auditLogService.getAuditLogs({ ...f, page: p, limit: DEFAULT_PAGE_SIZE });
            const d = res.data?.data;
            setLogs(d?.items || []);
            setTotal(d?.pagination?.total || 0);
            setTotalPages(d?.pagination?.totalPages || 1);
        } catch (e) {
            toast.error('Không thể tải nhật ký');
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        loadMeta();
    }, [loadMeta]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleApplyFilters = () => {
        setPage(1);
        loadLogs({ ...filters }, 1);
    };

    const handleResetFilters = () => {
        setFilters({ fromDate: '', toDate: '', tenDangNhap: '', action: '', tableName: '' });
        setPage(1);
        loadLogs({ fromDate: '', toDate: '', tenDangNhap: '', action: '', tableName: '' }, 1);
    };

    const handleViewDetail = async (logId) => {
        setLoadingDetail(true);
        setDetailLog(null);
        try {
            const res = await auditLogService.getById(logId);
            setDetailLog(res.data?.data);
        } catch (e) {
            toast.error('Không thể tải chi tiết');
        } finally {
            setLoadingDetail(false);
        }
    };

    const columns = [
        {
            header: 'Thời gian',
            accessor: 'timestamp',
            render: (v) => (
                <div className="text-sm">
                    <div className="font-medium text-neutral-900">
                        {dayjs(v).format('DD/MM/YYYY')}
                    </div>
                    <div className="text-neutral-500 text-xs">
                        {dayjs(v).format('HH:mm:ss')}
                    </div>
                </div>
            ),
        },
        {
            header: 'Người dùng',
            accessor: 'tenDangNhap',
            render: (v) => v ? (
                <span className="font-mono text-sm font-medium text-neutral-800">{v}</span>
            ) : (
                <span className="text-neutral-400 italic">System</span>
            ),
        },
        {
            header: 'Hành động',
            accessor: 'action',
            render: (v) => (
                <Badge variant={ACTION_VARIANT(v)} size="sm">
                    {ACTION_LABEL(v)}
                </Badge>
            ),
        },
        {
            header: 'Bảng',
            accessor: 'tableName',
            render: (v) => v ? (
                <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono">{v}</code>
            ) : null,
        },
        {
            header: 'Record ID',
            accessor: 'recordId',
            render: (v) => v ? (
                <span className="text-xs text-neutral-500 font-mono">{v}</span>
            ) : null,
        },
        {
            header: 'IP',
            accessor: 'ipAddress',
            render: (v) => v ? (
                <span className="text-xs text-neutral-400 font-mono">{v}</span>
            ) : null,
        },
        {
            header: '',
            accessor: 'logId',
            render: (id, row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    title="Xem chi tiết"
                    onClick={() => handleViewDetail(id)}
                >
                    <Eye className="w-4 h-4" />
                </Button>
            ),
        },
    ];

    // Daily chart (simple text list)
    const dailyStats = stats?.daily || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nhật ký hệ thống"
                subtitle={`Theo dõi mọi thao tác trên hệ thống — Admin xem được tất cả hành động`}
                icon={ScrollText}
            />

            {/* Stats cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Tổng bản ghi"
                        value={stats.tongSoBanGhi}
                        icon={ScrollText}
                        className="text-primary-600"
                    />
                    <StatCard
                        title="Người dùng hoạt động"
                        value={stats.soNguoiDung}
                        icon={Users}
                        className="text-info-600"
                    />
                    <StatCard
                        title="Loại hành động"
                        value={stats.soLoaiHanhDong}
                        icon={ListChecks}
                        className="text-warning-600"
                    />
                    <StatCard
                        title="Ngày hoạt động"
                        value={stats.soNgayHoatDong}
                        icon={Calendar}
                        className="text-success-600"
                    />
                </div>
            )}

            {/* Hoat dong nhieu nhat */}
            {stats && (stats.topActions?.length > 0 || stats.topUsers?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.topActions?.length > 0 && (
                        <div className="bg-white rounded-card border border-neutral-200 p-4">
                            <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-primary-600" />
                                Hành động nhiều nhất (7 ngày)
                            </h3>
                            <div className="space-y-2">
                                {stats.topActions.map(a => (
                                    <div key={a.action} className="flex items-center justify-between">
                                        <Badge variant={ACTION_VARIANT(a.action)} size="sm">
                                            {ACTION_LABEL(a.action)}
                                        </Badge>
                                        <span className="text-sm font-semibold text-neutral-700">
                                            {a.soLan} lần
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {stats.topUsers?.length > 0 && (
                        <div className="bg-white rounded-card border border-neutral-200 p-4">
                            <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-info-600" />
                                Người dùng hoạt động nhiều nhất
                            </h3>
                            <div className="space-y-2">
                                {stats.topUsers.map(u => (
                                    <div key={u.tenDangNhap} className="flex items-center justify-between">
                                        <span className="font-mono text-sm font-medium text-neutral-800">
                                            {u.tenDangNhap}
                                        </span>
                                        <span className="text-sm font-semibold text-neutral-700">
                                            {u.soLan} lần
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-card border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                        <Filter className="w-4 h-4" />
                        Bộ lọc
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {showFilters ? 'Ẩn lọc' : 'Hiện lọc'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reset
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <Input
                            label="Từ ngày"
                            type="date"
                            value={filters.fromDate}
                            onChange={e => handleFilterChange('fromDate', e.target.value)}
                        />
                        <Input
                            label="Đến ngày"
                            type="date"
                            value={filters.toDate}
                            onChange={e => handleFilterChange('toDate', e.target.value)}
                        />
                        <Input
                            label="Người dùng"
                            placeholder="Tìm username..."
                            value={filters.tenDangNhap}
                            onChange={e => handleFilterChange('tenDangNhap', e.target.value)}
                        />
                        <Select
                            label="Hành động"
                            value={filters.action}
                            onChange={e => handleFilterChange('action', e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {actions.map(a => (
                                <option key={a} value={a}>{ACTION_LABEL(a)} ({a})</option>
                            ))}
                        </Select>
                        <Select
                            label="Bảng"
                            value={filters.tableName}
                            onChange={e => handleFilterChange('tableName', e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {tables.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </Select>
                        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                            <Button onClick={handleApplyFilters} size="sm">
                                <Search className="w-4 h-4 mr-1" />
                                Tìm kiếm
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-sm text-neutral-600">
                        {loading ? 'Đang tải...' : `${total} bản ghi`}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadLogs()}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <Table
                    columns={columns}
                    data={logs}
                    loading={loading}
                    emptyMessage="Không có bản ghi nào"
                />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            {/* Detail Modal */}
            <Modal
                open={!!detailLog || loadingDetail}
                onClose={() => setDetailLog(null)}
                title="Chi tiết nhật ký"
                size="lg"
            >
                {loadingDetail ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                ) : detailLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-neutral-500">Thời gian:</span>
                                <div className="font-medium">
                                    {dayjs(detailLog.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Người dùng:</span>
                                <div className="font-medium font-mono">{detailLog.tenDangNhap || 'System'}</div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Hành động:</span>
                                <div className="mt-0.5">
                                    <Badge variant={ACTION_VARIANT(detailLog.action)}>
                                        {ACTION_LABEL(detailLog.action)}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Bảng / Record:</span>
                                <div className="font-medium">
                                    {detailLog.tableName || '-'} {detailLog.recordId ? `→ ${detailLog.recordId}` : ''}
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">IP Address:</span>
                                <div className="font-mono text-xs">{detailLog.ipAddress || '-'}</div>
                            </div>
                            <div>
                                <span className="text-neutral-500">User Agent:</span>
                                <div className="font-mono text-xs truncate">{detailLog.userAgent || '-'}</div>
                            </div>
                        </div>

                        {detailLog.oldValue && (
                            <div>
                                <span className="text-sm font-semibold text-neutral-700 block mb-1">
                                    Giá trị cũ (Old Value)
                                </span>
                                <pre className="bg-neutral-50 border border-neutral-200 rounded px-3 py-2 text-xs font-mono overflow-x-auto max-h-48">
                                    {JSON.stringify(detailLog.oldValue, null, 2)}
                                </pre>
                            </div>
                        )}

                        {detailLog.newValue && (
                            <div>
                                <span className="text-sm font-semibold text-neutral-700 block mb-1">
                                    Giá trị mới (New Value)
                                </span>
                                <pre className="bg-neutral-50 border border-neutral-200 rounded px-3 py-2 text-xs font-mono overflow-x-auto max-h-48">
                                    {JSON.stringify(detailLog.newValue, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
