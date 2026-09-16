/**
 * ThongKeHoaDonTab - Doanh thu + Top thuốc (All roles)
 *
 * Nâng cấp:
 *  - DateRangePresets (Hôm nay / 7 / 30 / Tháng / Quý / Năm / Custom)
 *  - DeltaIndicator: so sánh với kỳ trước (cùng độ dài)
 *  - Fill ngày trống = 0 (chart đỡ giật khi có ngày không có HĐ)
 *  - 8 stat cards + 2 biểu đồ (LineChart doanh thu + BarChart top thuốc)
 */
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
    Receipt,
    TrendingUp,
    Award,
    Users,
    UserCircle,
    Wallet,
    CircleDollarSign,
    ArrowDownLeft,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import thongKeService from '../../services/thongKeService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import LoadingState from '../../components/ui/LoadingState';
import DateRangePresets from '../../components/common/DateRangePresets';
import DeltaIndicator from '../../components/common/DeltaIndicator';
import { formatCurrency } from '../../utils/format';
import ReportExportActions from '../../components/common/ReportExportActions';

const todayStr = () => dayjs().format('YYYY-MM-DD');
const monthAgoStr = () => dayjs().subtract(29, 'day').format('YYYY-MM-DD');

function ThongKeHoaDonTab() {
    const [fromDate, setFromDate] = useState(monthAgoStr);
    const [toDate, setToDate] = useState(todayStr);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async (from, to) => {
        setLoading(true);
        try {
            const res = await thongKeService.getHoaDon({
                from: from || undefined,
                to: to || undefined,
            });
            setData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Không thể tải thống kê hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(fromDate, toDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = (from, to) => {
        setFromDate(from);
        setToDate(to);
        fetchData(from, to);
    };

    const ss = data?.soSanhKyTruoc;
    const reportSections = data ? [
        {
            title: 'Tổng quan hóa đơn',
            rows: [
                { 'Chỉ số': 'Số hóa đơn', 'Giá trị': data.tongQuan.soHoaDon },
                { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': data.tongQuan.tongDoanhThu },
                { 'Chỉ số': 'Doanh thu trung bình', 'Giá trị': data.tongQuan.doanhThuTrungBinh },
                { 'Chỉ số': 'Hóa đơn cao nhất', 'Giá trị': data.tongQuan.doanhThuCaoNhat },
            ],
        },
        {
            title: 'Doanh thu theo ngày',
            rows: data.doanhThuTheoNgay.map((item) => ({
                'Ngày': dayjs(item.ngay).format('DD/MM/YYYY'),
                'Số hóa đơn': item.soHoaDon,
                'Doanh thu': item.doanhThu,
            })),
        },
        {
            title: 'Thuốc bán chạy',
            rows: data.topThuocBanChay.map((item) => ({
                'Mã thuốc': item.maThuoc,
                'Tên thuốc': item.tenThuoc,
                'Danh mục': item.tenDM,
                'Số lượng bán': item.tongSoLuongBan,
                'Doanh thu': item.tongDoanhThu,
            })),
        },
    ] : [];

    const stats = data
        ? [
            {
                label: 'Số hóa đơn',
                value: data.tongQuan.soHoaDon.toLocaleString('vi-VN'),
                icon: <Receipt className="h-5 w-5" />,
                color: 'primary',
                delta: ss && { pct: ss.soHoaDon, label: 'so với kỳ trước' },
            },
            {
                label: 'Tổng doanh thu',
                value: formatCurrency(data.tongQuan.tongDoanhThu),
                icon: <Wallet className="h-5 w-5" />,
                color: 'success',
                delta: ss && { pct: ss.tongDoanhThu, label: 'so với kỳ trước' },
            },
            {
                label: 'Doanh thu TB/HĐ',
                value: formatCurrency(Math.round(data.tongQuan.doanhThuTrungBinh)),
                icon: <TrendingUp className="h-5 w-5" />,
                color: 'info',
            },
            {
                label: 'HĐ cao nhất',
                value: formatCurrency(data.tongQuan.doanhThuCaoNhat),
                icon: <Award className="h-5 w-5" />,
                color: 'warning',
            },
            {
                label: 'Tiền khách đưa',
                value: formatCurrency(data.tongQuan.tongTienKhachDua),
                icon: <CircleDollarSign className="h-5 w-5" />,
                color: 'primary',
            },
            {
                label: 'Tiền trả lại',
                value: formatCurrency(data.tongQuan.tongTienTraLai),
                icon: <ArrowDownLeft className="h-5 w-5" />,
                color: 'danger',
            },
            {
                label: 'Khách hàng',
                value: data.tongQuan.soKhachHang.toLocaleString('vi-VN'),
                icon: <Users className="h-5 w-5" />,
                color: 'info',
            },
            {
                label: 'NV bán hàng',
                value: data.tongQuan.soNhanVienBan.toLocaleString('vi-VN'),
                icon: <UserCircle className="h-5 w-5" />,
                color: 'primary',
            },
        ]
        : [];

    // Line chart data: convert date -> dd/MM format
    const lineData =
        data?.doanhThuTheoNgay.map((d) => ({
            ngayLabel: dayjs(d.ngay).format('DD/MM'),
            doanhThu: d.doanhThu,
            soHoaDon: d.soHoaDon,
        })) || [];

    // Bar chart data: top thuốc (cắt tên dài)
    const barData =
        data?.topThuocBanChay.map((t) => ({
            tenThuoc:
                t.tenThuoc.length > 20 ? t.tenThuoc.substring(0, 20) + '...' : t.tenThuoc,
            tongSoLuongBan: t.tongSoLuongBan,
            tongDoanhThu: t.tongDoanhThu,
        })) || [];

    const columnsTopThuoc = [
        {
            key: 'rank',
            label: '#',
            width: '50px',
            render: (it, idx) => (
                <span className="font-mono font-bold text-primary-700">#{idx + 1}</span>
            ),
        },
        {
            key: 'ten',
            label: 'Tên thuốc',
            render: (it) => (
                <Link
                    to={`/thuoc/${it.maThuoc}`}
                    className="text-primary-700 hover:text-primary-600 font-medium"
                >
                    {it.tenThuoc}
                </Link>
            ),
        },
        {
            key: 'dm',
            label: 'Danh mục',
            width: '180px',
            render: (it) => (
                <span className="text-caption text-neutral-600">{it.tenDM}</span>
            ),
        },
        {
            key: 'sl',
            label: 'SL bán',
            width: '110px',
            align: 'right',
            render: (it) => (
                <span className="font-mono font-semibold">
                    {it.tongSoLuongBan.toLocaleString('vi-VN')}
                </span>
            ),
        },
        {
            key: 'dt',
            label: 'Doanh thu',
            width: '160px',
            align: 'right',
            render: (it) => (
                <span className="font-mono font-semibold text-success-700">
                    {formatCurrency(it.tongDoanhThu)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filter */}
            <Card>
                <DateRangePresets
                    fromDate={fromDate}
                    toDate={toDate}
                    onApply={handleApply}
                    loading={loading}
                    actions={(
                      <ReportExportActions
                        filename={`bao-cao-hoa-don-${fromDate}-${toDate}`}
                        title="Báo cáo hóa đơn"
                        subtitle={`Từ ${dayjs(fromDate).format('DD/MM/YYYY')} đến ${dayjs(toDate).format('DD/MM/YYYY')}`}
                        sections={reportSections}
                        disabled={!data || loading}
                        className="justify-start lg:justify-end"
                      />
                    )}
                />
            </Card>

            {/* Khoảng thời gian đang xem */}
            {ss?.kyTruoc && (
                <p className="text-caption text-neutral-500 -mt-3">
                    Đang so sánh với {dayjs(ss.kyTruoc.fromDate).format('DD/MM/YYYY')} – {dayjs(ss.kyTruoc.toDate).format('DD/MM/YYYY')} (cùng độ dài kỳ trước).
                </p>
            )}

            {/* Stats */}
            {data && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
                    {stats.map((s) => (
                        <div key={s.label} className="relative">
                            <StatCard {...s} />
                            {s.delta && (
                                <div className="absolute top-3 right-3">
                                    <DeltaIndicator pct={s.delta.pct} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Line chart */}
            <Card title="Doanh thu theo ngày" subtitle="Biểu đồ đường - Xu hướng doanh thu">
                {loading ? (
                    <LoadingState label="Đang tải biểu đồ..." />
                ) : lineData.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-neutral-500">
                        Không có dữ liệu trong khoảng thời gian này
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="ngayLabel" tick={{ fontSize: 12 }} />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value, name) => {
                                    if (name === 'Doanh thu') return [formatCurrency(value), 'Doanh thu'];
                                    if (name === 'Số hóa đơn') return [value, 'Số hóa đơn'];
                                    return [value, name];
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="doanhThu"
                                name="Doanh thu"
                                yAxisId="left"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="soHoaDon"
                                name="Số hóa đơn"
                                yAxisId="right"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ fill: '#10B981', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* Bar chart + Table */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card title="Top 10 thuốc bán chạy" subtitle="Xếp theo số lượng bán" className="xl:col-span-2">
                    {loading ? (
                        <LoadingState label="Đang tải..." />
                    ) : barData.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-neutral-500">
                            Chưa có dữ liệu bán hàng
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis
                                    type="category"
                                    dataKey="tenThuoc"
                                    width={140}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'tongSoLuongBan') return [`${value} SP`, 'Số lượng'];
                                        return [value, name];
                                    }}
                                />
                                <Bar
                                    dataKey="tongSoLuongBan"
                                    name="Số lượng bán"
                                    fill="#3B82F6"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <Card title="Chi tiết top thuốc" padding={false}>
                    {data && (
                        <Table
                            columns={columnsTopThuoc}
                            data={data.topThuocBanChay}
                            rowKey="maThuoc"
                            emptyTitle="Chưa có dữ liệu"
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}

export default ThongKeHoaDonTab;
