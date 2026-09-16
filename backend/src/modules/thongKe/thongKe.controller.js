/**
 * ThongKe Controller - 3 dashboard tổng hợp
 *  - GET /kho        [All]     Tồn kho + cảnh báo
 *  - GET /hoa-don    [All]     Doanh thu + top thuốc
 *  - GET /tai-chinh  [Admin]   Tổng thu/chi/lợi nhuận
 */
const thongKeService = require('./thongKe.service');
const { validateDateRange } = require('./dateRange.logic');
const { asyncHandler } = require('../../middleware/errorHandler');
const { success, error } = require('../../utils/response');

function validateRangeOrRespond(res, from, to) {
    try {
        validateDateRange(from, to);
        return true;
    } catch (err) {
        error(res, err.message, 400);
        return false;
    }
}

const getKho = asyncHandler(async (req, res) => {
    const data = await thongKeService.thongKeKho();
    return success(res, data);
});

const getHoaDon = asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    if (!validateRangeOrRespond(res, from, to)) return;
    const data = await thongKeService.thongKeHoaDon({ fromDate: from, toDate: to });
    return success(res, data);
});

const getTaiChinh = asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    if (!validateRangeOrRespond(res, from, to)) return;
    const data = await thongKeService.thongKeTaiChinh({ fromDate: from, toDate: to });
    return success(res, data);
});

module.exports = { getKho, getHoaDon, getTaiChinh };
