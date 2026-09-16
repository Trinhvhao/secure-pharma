import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Plus, ReceiptText } from 'lucide-react';
import phieuThuService from '../../services/phieuThuService';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

const emptyForm = { soTien: '', noiDung: '' };

function PhieuThuListPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', from: '', to: '', loaiPhieu: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  useEffect(() => {
    if (!hasRole(['Admin', 'NV_BanHang'])) navigate('/forbidden', { replace: true });
  }, [hasRole, navigate]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await phieuThuService.getAll({
        ...filters,
        page,
        limit: DEFAULT_PAGE_SIZE,
      });
      setItems(response.data?.items || []);
      setPagination(response.data?.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Không thể tải danh sách phiếu thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasRole(['Admin', 'NV_BanHang'])) return undefined;
    const timer = setTimeout(() => fetchData(1), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.from, filters.to, filters.loaiPhieu]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const soTien = Number(form.soTien);
    if (!Number.isFinite(soTien) || soTien <= 0 || !form.noiDung.trim()) return;
    setSubmitting(true);
    try {
      await phieuThuService.create({ soTien, noiDung: form.noiDung.trim() });
      toast.success('Đã ghi nhận phiếu thu');
      setShowCreate(false);
      setForm(emptyForm);
      fetchData(1);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Không thể tạo phiếu thu');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'id', label: 'Mã PT', width: '90px',
      render: (item) => <span className="font-mono text-neutral-500">#{item.MaPhieuThu}</span>,
    },
    {
      key: 'date', label: 'Ngày lập', width: '160px',
      render: (item) => dayjs(item.NgayLap).format('DD/MM/YYYY HH:mm'),
    },
    {
      key: 'type', label: 'Loại', width: '120px',
      render: (item) => (
        <Badge variant={item.LoaiPhieu === 'BanHang' ? 'primary' : 'info'} size="sm">
          {item.LoaiPhieu === 'BanHang' ? 'Bán hàng' : 'Thu khác'}
        </Badge>
      ),
    },
    { key: 'content', label: 'Nội dung', render: (item) => item.NoiDung },
    { key: 'staff', label: 'Người lập', width: '170px', render: (item) => item.TenNV || `NV #${item.MaNV}` },
    {
      key: 'amount', label: 'Số tiền', width: '160px', align: 'right',
      render: (item) => (
        <span className={item.TrangThai === 'CoHieuLuc'
          ? 'font-mono font-semibold text-success-700'
          : 'font-mono text-neutral-400 line-through'}>
          +{formatCurrency(Number(item.SoTien) || 0)}
        </span>
      ),
    },
    {
      key: 'status', label: 'Trạng thái', width: '125px', align: 'center',
      render: (item) => (
        <Badge variant={item.TrangThai === 'CoHieuLuc' ? 'success' : 'neutral'} size="sm">
          {item.TrangThai === 'CoHieuLuc' ? 'Có hiệu lực' : 'HĐ đã hủy'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ReceiptText />}
        title="Phiếu thu"
        subtitle={`Tổng ${pagination.total || 0} phiếu thu`}
        actions={(
          <Button icon={<Plus />} onClick={() => { setForm(emptyForm); setShowCreate(true); }}>
            Tạo phiếu thu
          </Button>
        )}
      />

      <SearchBar
        value={filters.keyword}
        onChange={(keyword) => setFilters((current) => ({ ...current, keyword }))}
        placeholder="Tìm theo mã phiếu, hóa đơn, nội dung, người lập..."
      >
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
          <input
            aria-label="Từ ngày"
            type="date"
            value={filters.from}
            max={filters.to || today}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            className="h-10 rounded-btn border border-neutral-300 px-3 text-body focus:border-primary-500 focus:outline-none"
          />
          <input
            aria-label="Đến ngày"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            max={today}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            className="h-10 rounded-btn border border-neutral-300 px-3 text-body focus:border-primary-500 focus:outline-none"
          />
          <Select
            aria-label="Loại phiếu thu"
            value={filters.loaiPhieu}
            onChange={(event) => setFilters((current) => ({ ...current, loaiPhieu: event.target.value }))}
            placeholder="Tất cả loại"
            options={[{ value: 'BanHang', label: 'Bán hàng' }, { value: 'Khac', label: 'Thu khác' }]}
          />
        </div>
      </SearchBar>

      <Table
        columns={columns}
        data={items}
        loading={loading}
        rowKey="MaPhieuThu"
        emptyTitle="Chưa có phiếu thu"
        emptyDescription="Phiếu bán hàng sẽ được tạo tự động khi thanh toán"
        emptyIcon={<ReceiptText />}
        onRowClick={setViewItem}
      />
      <Pagination
        page={pagination.page || 1}
        totalPages={pagination.totalPages || 0}
        total={pagination.total || 0}
        onChange={fetchData}
        loading={loading}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tạo phiếu thu khác">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="rounded-card border border-info-100 bg-info-50 p-3 text-caption text-info-700">
            Thu từ bán hàng được tạo tự động. Form này dành cho khoản thu ngoài hóa đơn.
          </p>
          <Input
            label="Số tiền (VND)"
            required
            type="number"
            min="1"
            step="1000"
            value={form.soTien}
            onChange={(event) => setForm((current) => ({ ...current, soTien: event.target.value }))}
            inputClassName="text-right font-mono"
          />
          <div>
            <label htmlFor="phieu-thu-noi-dung" className="mb-1.5 block text-body font-medium text-neutral-700">
              Nội dung <span className="text-danger-600">*</span>
            </label>
            <textarea
              id="phieu-thu-noi-dung"
              required
              maxLength={500}
              rows={4}
              value={form.noiDung}
              onChange={(event) => setForm((current) => ({ ...current, noiDung: event.target.value }))}
              className="w-full resize-none rounded-btn border border-neutral-300 px-3 py-2 text-body focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Ví dụ: Thu hoàn ứng..."
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4">
            <Button variant="ghost" onClick={() => setShowCreate(false)} disabled={submitting}>Hủy</Button>
            <Button type="submit" loading={submitting} disabled={!form.soTien || !form.noiDung.trim()}>
              Ghi nhận phiếu thu
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem ? `Phiếu thu #${viewItem.MaPhieuThu}` : ''}
      >
        {viewItem && (
          <dl className="grid grid-cols-2 gap-4 text-body">
            <div><dt className="text-caption text-neutral-500">Ngày lập</dt><dd>{dayjs(viewItem.NgayLap).format('DD/MM/YYYY HH:mm')}</dd></div>
            <div><dt className="text-caption text-neutral-500">Loại phiếu</dt><dd>{viewItem.LoaiPhieu === 'BanHang' ? 'Bán hàng' : 'Thu khác'}</dd></div>
            <div className="col-span-2"><dt className="text-caption text-neutral-500">Nội dung</dt><dd>{viewItem.NoiDung}</dd></div>
            <div><dt className="text-caption text-neutral-500">Người lập</dt><dd>{viewItem.TenNV}</dd></div>
            <div><dt className="text-caption text-neutral-500">Hóa đơn</dt><dd>{viewItem.MaHD ? `#${viewItem.MaHD}` : '—'}</dd></div>
            <div className="col-span-2 border-t border-neutral-200 pt-3">
              <dt className="text-caption text-neutral-500">Số tiền</dt>
              <dd className="font-mono text-h2 font-bold text-success-700">+{formatCurrency(Number(viewItem.SoTien) || 0)}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}

export default PhieuThuListPage;
