/**
 * SystemConfigPage — Cau hinh he thong (Admin only)
 *
 * Tinh nang:
 *  - Hien thi danh sach cau hinh hien tai
 *  - Chinh sua gia tri truc tiep trong bang
 *  - Mo ta va nguoi cap nhat cuoi cung
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    Settings, Save, RefreshCw, Pencil, X, Check,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import systemConfigService from '../../services/systemConfigService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/format';

dayjs.locale('vi');

export default function SystemConfigPage() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);

    // Edit state: key dang duoc sua
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Confirm dialog
    const [confirmSave, setConfirmSave] = useState(false);

    const loadConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await systemConfigService.getAll();
            setConfigs(res.data?.data || []);
        } catch (e) {
            toast.error('Không thể tải cấu hình');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConfigs();
    }, [loadConfigs]);

    const handleStartEdit = (config) => {
        setEditingKey(config.key);
        setEditValue(String(config.value ?? ''));
    };

    const handleCancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const handleSave = async () => {
        if (!editingKey) return;
        setConfirmSave(false);
        setSavingKey(editingKey);
        try {
            await systemConfigService.set(editingKey, editValue);
            toast.success('Cập nhật thành công');
            setEditingKey(null);
            setEditValue('');
            await loadConfigs();
        } catch (e) {
            toast.error(e?.response?.data?.error?.message || 'Lỗi khi lưu');
        } finally {
            setSavingKey(null);
        }
    };

    // Categorize configs
    const shopConfigs = configs.filter(c =>
        ['TEN_CUA_HANG', 'DIA_CHI_CUA_HANG', 'SO_DIEN_THOAI_CUA_HANG'].includes(c.key)
    );
    const alertConfigs = configs.filter(c =>
        ['SO_NGAY_CANH_BAO_HET_HAN', 'SO_NGAY_CANH_BAO_HET_HANG'].includes(c.key)
    );
    const bizConfigs = configs.filter(c =>
        ['TI_LE_LAI_NHUAN_MAC_DINH', 'VAT_RATE', 'HE_SO_GIA_BAN_MAC_DINH'].includes(c.key)
    );
    const otherConfigs = configs.filter(c =>
        ![...shopConfigs, ...alertConfigs, ...bizConfigs].some(x => x.key === c.key)
    );

    const renderConfigRow = (config) => {
        const isEditing = editingKey === config.key;
        const isSaving = savingKey === config.key;

        return (
            <div
                key={config.key}
                className="flex items-start gap-3 py-3 px-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">
                            {config.key}
                        </code>
                        {config.description && (
                            <span className="text-xs text-neutral-500 truncate max-w-xs">
                                {config.description}
                            </span>
                        )}
                    </div>
                    {config.updatedAt && (
                        <div className="text-xs text-neutral-400 mt-0.5">
                            Cập nhật: {dayjs(config.updatedAt).format('DD/MM/YYYY HH:mm')} bởi {config.updatedBy}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                        <>
                            <Input
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                className="w-64 text-sm"
                                autoFocus
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setConfirmSave(true)}
                                loading={isSaving}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Lưu
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="text-sm font-medium text-neutral-800 min-w-[80px] text-right">
                                {String(config.value ?? '')}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(config)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderSection = (title, items) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
                </div>
                <div>
                    {items.map(renderConfigRow)}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Cấu hình hệ thống"
                subtitle="Thay đổi các tham số hoạt động của hệ thống — không cần restart server"
                icon={Settings}
            />

            {/* Luu y */}
            <div className="bg-amber-50 border border-amber-200 rounded-card px-4 py-3 text-sm text-amber-800">
                <strong>Lưu ý:</strong> Các thay đổi có hiệu lực ngay. JWT_SECRET, DB_PASSWORD
                vẫn nằm trong file <code className="font-mono bg-amber-100 px-1 rounded">.env</code> vì lý do bảo mật.
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                </div>
            ) : (
                <div className="space-y-6">
                    {renderSection('🏪 Thông tin cửa hàng', shopConfigs)}
                    {renderSection('⚠️ Ngưỡng cảnh báo', alertConfigs)}
                    {renderSection('📊 Nghiệp vụ mặc định', bizConfigs)}
                    {otherConfigs.length > 0 && renderSection('⚙️ Khác', otherConfigs)}

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={loadConfigs}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Làm mới
                        </Button>
                    </div>
                </div>
            )}

            {/* Confirm save */}
            <ConfirmDialog
                open={confirmSave}
                onClose={() => setConfirmSave(false)}
                onConfirm={handleSave}
                title="Xác nhận lưu cấu hình"
                message={`Bạn có chắc muốn lưu thay đổi cho "${editingKey}"?`}
                confirmText="Lưu"
                loading={!!savingKey}
            />
        </div>
    );
}
