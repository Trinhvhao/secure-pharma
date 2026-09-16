/**
 * NhaCungCap Controller
 *
 * Endpoints:
 *  GET  /api/nha-cung-cap           - Danh sách + filter (keyword, segment)
 *  GET  /api/nha-cung-cap/stats    - Thống kê tổng quan (cards đầu trang)
 *  GET  /api/nha-cung-cap/:id      - Chi tiết + stats aggregate
 *  GET  /api/nha-cung-cap/:id/phieu-nhap - Lịch sử phiếu nhập của NCC
 *  POST /api/nha-cung-cap           - Tạo (Admin only)
 *  PUT  /api/nha-cung-cap/:id       - Cập nhật (Admin only)
 *  DELETE /api/nha-cung-cap/:id     - Xóa (Admin only)
 */
const nccService = require('./nhaCungCap.service');
const { success, created, notFound, error, successPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const { keyword = '', segment = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { items, total } = await nccService.getAll({ keyword, segment, page, limit });
    return successPaginated(res, items, total, page, limit);
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await nccService.getStats();
    return success(res, stats);
});

const getById = asyncHandler(async (req, res) => {
    const item = await nccService.getById(parseInt(req.params.id, 10));
    if (!item) return notFound(res, `Không tìm thấy NCC #${req.params.id}`);
    return success(res, item);
});

/**
 * Lịch sử phiếu nhập Đã nhập của 1 NCC.
 * Mặc định trả về 10 phiếu gần nhất; tối đa 50.
 */
const getPhieuNhapByNCC = asyncHandler(async (req, res) => {
    const maNCC = parseInt(req.params.id, 10);
    // Đảm bảo NCC tồn tại trước khi trả list (tránh lộ thông tin)
    const ncc = await nccService.getById(maNCC);
    if (!ncc) return notFound(res, `Không tìm thấy NCC #${maNCC}`);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const items = await nccService.getPhieuNhapByNCC(maNCC, limit);
    return success(res, items);
});

const create = asyncHandler(async (req, res) => {
    const { tenNCC, diaChi, sdt } = req.body;
    if (!tenNCC) return error(res, 'Vui lòng nhập tên nhà cung cấp', 400);

    // Validate SĐT: 10-11 số
    if (sdt && sdt.trim() && !/^\d{10,11}$/.test(sdt.trim())) {
        return error(res, 'Số điện thoại phải là 10-11 chữ số', 400);
    }

    const item = await nccService.create({ tenNCC, diaChi: diaChi || null, sdt: sdt ? sdt.trim() : null });
    return created(res, item, 'Tạo nhà cung cấp thành công');
});

const update = asyncHandler(async (req, res) => {
    const { tenNCC, diaChi, sdt } = req.body;
    if (!tenNCC) return error(res, 'Vui lòng nhập tên nhà cung cấp', 400);
    if (sdt && sdt.trim() && !/^\d{10,11}$/.test(sdt.trim())) {
        return error(res, 'Số điện thoại phải là 10-11 chữ số', 400);
    }
    const item = await nccService.update(parseInt(req.params.id, 10), { tenNCC, diaChi: diaChi || null, sdt: sdt ? sdt.trim() : null });
    if (!item) return notFound(res, `Không tìm thấy NCC #${req.params.id}`);
    return success(res, item, 'Cập nhật thành công');
});

const remove = asyncHandler(async (req, res) => {
    const deleted = await nccService.remove(parseInt(req.params.id, 10));
    if (!deleted) return notFound(res, `Không tìm thấy NCC #${req.params.id}`);
    return success(res, null, 'Xóa thành công');
});

module.exports = { getAll, getStats, getById, getPhieuNhapByNCC, create, update, remove };
