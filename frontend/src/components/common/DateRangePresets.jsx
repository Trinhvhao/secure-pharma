/**
 * DateRangePresets - Bộ lọc khoảng thời gian có presets cho trang Thống kê
 *
 * Các preset:
 *  - Hôm nay
 *  - 7 ngày qua
 *  - 30 ngày qua (mặc định)
 *  - Tháng này
 *  - Quý này
 *  - Năm nay
 *
 * Props:
 *  - fromDate, toDate (YYYY-MM-DD)
 *  - onChange({ fromDate, toDate }) - được gọi khi user chọn preset hoặc đổi ngày custom
 *  - onApply() - bắt buộc click nút "Thống kê" mới fetch (tránh gọi API liên tục khi đổi ngày custom)
 *  - loading
 */
import { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Calendar, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

const PRESETS = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7', label: '7 ngày qua' },
    { key: '30', label: '30 ngày qua' },
    { key: 'month', label: 'Tháng này' },
    { key: 'quarter', label: 'Quý này' },
    { key: 'year', label: 'Năm nay' },
];

function resolvePreset(key) {
    const today = dayjs();
    switch (key) {
        case 'today':
            return { fromDate: today.format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') };
        case '7':
            return { fromDate: today.subtract(6, 'day').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') };
        case '30':
            return { fromDate: today.subtract(29, 'day').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') };
        case 'month':
            return { fromDate: today.startOf('month').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') };
        case 'quarter':
            return { fromDate: today.startOf('quarter').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') };
        case 'year':
            return { fromDate: today.startOf('year').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') };
        default:
            return null;
    }
}

export default function DateRangePresets({
    fromDate,
    toDate,
    onApply,
    loading = false,
    className,
}) {
    const todayStr = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

    // State cục bộ cho input (chỉ apply khi bấm nút)
    const [localFrom, setLocalFrom] = useState(fromDate);
    const [localTo, setLocalTo] = useState(toDate);

    // Detect preset đang active dựa trên fromDate/toDate hiện tại
    const activePreset = useMemo(() => {
        for (const p of PRESETS) {
            const r = resolvePreset(p.key);
            if (r && r.fromDate === fromDate && r.toDate === toDate) return p.key;
        }
        return null;
    }, [fromDate, toDate]);

    // Khi prop đổi (parent reset), sync local
    useEffect(() => { setLocalFrom(fromDate); }, [fromDate]);
    useEffect(() => { setLocalTo(toDate); }, [toDate]);

    const handlePresetClick = (key) => {
        const r = resolvePreset(key);
        if (!r) return;
        // Apply ngay khi click preset
        onApply(r.fromDate, r.toDate);
    };

    const handleApplyCustom = () => {
        // Validate: from <= to
        if (localFrom && localTo && localFrom > localTo) {
            return; // không apply nếu sai thứ tự
        }
        onApply(localFrom || null, localTo || null);
    };

    const hasCustomRange = activePreset === null;
    const canApply = localFrom && localTo && localFrom <= localTo;

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-caption font-medium text-neutral-700">
                    <Calendar className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                    <span>Khoảng thời gian:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => handlePresetClick(p.key)}
                            className={cn(
                                'px-3 py-1.5 text-caption rounded-btn border transition-colors',
                                activePreset === p.key
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                    {hasCustomRange && (
                        <span className="px-3 py-1.5 text-caption rounded-btn border bg-info-50 text-info-700 border-info-200">
                            Tùy chỉnh
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col">
                    <label htmlFor="tk-from" className="text-caption font-semibold text-neutral-700 mb-1.5">
                        Từ ngày
                    </label>
                    <input
                        id="tk-from"
                        type="date"
                        value={localFrom || ''}
                        max={localTo || todayStr}
                        onChange={(e) => setLocalFrom(e.target.value)}
                        className="h-10 px-3 text-body border border-neutral-300 rounded-btn focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
                <span className="text-neutral-400 pb-2.5">—</span>
                <div className="flex flex-col">
                    <label htmlFor="tk-to" className="text-caption font-semibold text-neutral-700 mb-1.5">
                        Đến ngày
                    </label>
                    <input
                        id="tk-to"
                        type="date"
                        value={localTo || ''}
                        min={localFrom || undefined}
                        max={todayStr}
                        onChange={(e) => setLocalTo(e.target.value)}
                        className="h-10 px-3 text-body border border-neutral-300 rounded-btn focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
                <Button
                    variant="primary"
                    icon={<Search className="h-4 w-4" />}
                    onClick={handleApplyCustom}
                    disabled={!canApply}
                    loading={loading}
                >
                    Thống kê
                </Button>
                {hasCustomRange && (localFrom || localTo) && (
                    <button
                        type="button"
                        onClick={() => {
                            const r = resolvePreset('30');
                            onApply(r.fromDate, r.toDate);
                        }}
                        className="text-caption text-neutral-500 hover:text-neutral-700 pb-2.5 underline"
                    >
                        Reset về 30 ngày qua
                    </button>
                )}
            </div>
        </div>
    );
}

DateRangePresets.resolvePreset = resolvePreset;
