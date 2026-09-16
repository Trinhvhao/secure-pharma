/**
 * NhanVien Service
 *
 * Endpoints:
 *  GET    /api/nhan-vien             - Danh sách + filter (keyword, vaiTro, trangThai)
 *  GET    /api/nhan-vien/stats       - Thống kê tổng quan (4 stat cards)
 *  GET    /api/nhan-vien/:id         - Chi tiết + stats aggregate
 *  GET    /api/nhan-vien/:id/hoa-don - Lịch sử hóa đơn đã thanh toán
 *  POST   /api/nhan-vien             - Tạo mới (Admin only)
 *  PUT    /api/nhan-vien/:id         - Cập nhật
 *  DELETE /api/nhan-vien/:id         - Xóa
 */
import api from '../api/axiosClient';

const nhanVienService = {
    /**
     * Danh sách nhân viên với filter.
     * @param {{ keyword?: string, vaiTro?: string, trangThai?: string, page?: number, limit?: number }} params
     */
    getAll: async ({ keyword = '', vaiTro = '', trangThai = '', page = 1, limit = 10 } = {}) => {
        const params = { page, limit };
        if (keyword) params.keyword = keyword;
        if (vaiTro) params.vaiTro = vaiTro;
        if (trangThai) params.trangThai = trangThai;
        const response = await api.get('/nhan-vien', { params });
        return response.data;
    },

    /** Thống kê tổng quan cho stat cards đầu trang */
    getStats: async () => {
        const response = await api.get('/nhan-vien/stats');
        return response.data;
    },

    /** Chi tiết 1 nhân viên (kèm stats tích lũy) */
    getById: async (id) => {
        const response = await api.get(`/nhan-vien/${id}`);
        return response.data;
    },

    /** Lịch sử hóa đơn đã thanh toán */
    getHoaDonByNV: async (id, limit = 10) => {
        const response = await api.get(`/nhan-vien/${id}/hoa-don`, {
            params: { limit },
        });
        return response.data;
    },

    /** Tạo nhân viên mới */
    create: async (data) => {
        const response = await api.post('/nhan-vien', data);
        return response.data;
    },

    /** Cập nhật thông tin */
    update: async (id, data) => {
        const response = await api.put(`/nhan-vien/${id}`, data);
        return response.data;
    },

    /** Xóa nhân viên */
    remove: async (id) => {
        const response = await api.delete(`/nhan-vien/${id}`);
        return response.data;
    },
};

export default nhanVienService;
