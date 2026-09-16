/**
 * NhanVien Controller
 *
 * Endpoints:
 *  GET  /api/nhan-vien                - Danh sách + filter (keyword, vaiTro, trangThai)
 *  GET  /api/nhan-vien/stats         - Thống kê tổng quan
 *  GET  /api/nhan-vien/:id           - Chi tiết + stats aggregate
 *  GET  /api/nhan-vien/:id/hoa-don   - Lịch sử hóa đơn đã thanh toán
 *  POST /api/nhan-vien                - Tạo (Admin only)
 *  PUT  /api/nhan-vien/:id            - Cập nhật (Admin only)
 *  DELETE /api/nhan-vien/:id          - Xóa (Admin only)
 */
const nvService = require('./nhanVien.service');
const { success, created, notFound, error, successPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const { keyword = '', vaiTro = '', trangThai = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { items, total } = await nvService.getAll({ keyword, vaiTro, trangThai, page, limit });
    return successPaginated(res, items, total, page, limit);
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await nvService.getStats();
    return success(res, stats);
});

const getById = asyncHandler(async (req, res) => {
    const item = await nvService.getById(parseInt(req.params.id, 10));
    if (!item) return notFound(res, `Không tìm thấy NV #${req.params.id}`);
    return success(res, item);
});

const getHoaDonByNV = asyncHandler(async (req, res) => {
    const maNV = parseInt(req.params.id, 10);
    const nv = await nvService.getById(maNV);
    if (!nv) return notFound(res, `Không tìm thấy NV #${maNV}`);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const items = await nvService.getHoaDonByNV(maNV, limit);
    return success(res, items);
});

const create = asyncHandler(async (req, res) => {
    const { tenNV, sdt, gioiTinh, luong, ngayVaoLam, trangThai } = req.body;
    if (!tenNV) return error(res, 'Vui lòng nhập tên nhân viên', 400);

    const luongNum = Number(luong);
    if (luong !== undefined && luong !== null && luong !== '' && (isNaN(luongNum) || luongNum < 0)) {
        return error(res, 'Lương phải ≥ 0', 400);
    }

    const item = await nvService.create({ tenNV, sdt: sdt || null, gioiTinh: gioiTinh || null, luong: isNaN(luongNum) ? 0 : luongNum, ngayVaoLam: ngayVaoLam || null, trangThai: trangThai || 'DangLam' });
    return created(res, item, 'Tạo nhân viên thành công');
});

const update = asyncHandler(async (req, res) => {
    const { tenNV, sdt, gioiTinh, luong, trangThai } = req.body;
    if (!tenNV) return error(res, 'Vui lòng nhập tên nhân viên', 400);

    const luongNum = Number(luong);
    if (luong !== undefined && luong !== null && luong !== '' && (isNaN(luongNum) || luongNum < 0)) {
        return error(res, 'Lương phải ≥ 0', 400);
    }

    // Không cho thay đổi trạng thái của chính mình
    if (req.user && parseInt(req.params.id) === req.user.maNV) {
        if (trangThai && trangThai !== 'DangLam') {
            return error(res, 'Không thể thay đổi trạng thái của chính mình', 400);
        }
    }

    const item = await nvService.update(parseInt(req.params.id), { tenNV, sdt: sdt || null, gioiTinh: gioiTinh || null, luong: isNaN(luongNum) ? 0 : luongNum, trangThai: trangThai || 'DangLam' });
    if (!item) return notFound(res, `Không tìm thấy NV #${req.params.id}`);
    return success(res, item, 'Cập nhật thành công');
});

const remove = asyncHandler(async (req, res) => {
    // Không cho xóa chính mình
    if (req.user && parseInt(req.params.id) === req.user.maNV) {
        return error(res, 'Không thể xóa tài khoản của chính mình', 400);
    }

    const deleted = await nvService.remove(parseInt(req.params.id));
    if (!deleted) return notFound(res, `Không tìm thấy NV #${req.params.id}`);
    return success(res, null, 'Xóa nhân viên thành công');
});

module.exports = { getAll, getStats, getById, getHoaDonByNV, create, update, remove };
