/**
 * NhanVien Service - CRUD + Stats + Lịch sử hoạt động
 *
 * Nghiệp vụ:
 *  - CRUD cơ bản (TenNV, SDT, GioiTinh, Luong, NgayVaoLam, TrangThai)
 *  - Stats: tổng NV, đang làm, có tài khoản, mới trong 30 ngày
 *  - getById kèm stats: số HĐ, số PN, số Phiếu chi, tổng tiền bán
 *  - getHoaDonByNV: lịch sử hóa đơn đã thanh toán (max 10)
 *
 * Admin-only module.
 */
const db = require('../../config/db');
const { parsePagination } = require('../../utils/pagination');

async function getAll({ keyword = '', page = 1, limit = 10, vaiTro = '', trangThai = '' } = {}) {
    const { page: safePage, limit: safeLimit, offset } = parsePagination(page, limit);
    const params = {};

    const filters = [];
    if (keyword && keyword.trim()) {
        // Tìm theo TenNV, SDT
        filters.push('(nv.TenNV LIKE @kw OR (nv.SDT IS NOT NULL AND nv.SDT LIKE @kw))');
        params.kw = `%${keyword.trim()}%`;
    }
    if (trangThai) {
        filters.push('nv.TrangThai = @trangThai');
        params.trangThai = trangThai;
    }
    if (vaiTro) {
        filters.push('tk.VaiTro = @vaiTro');
        params.vaiTro = vaiTro;
    }
    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countR = await db.query(`
        SELECT COUNT(*) AS total
        FROM NhanVien nv
        LEFT JOIN TaiKhoan tk ON nv.MaNV = tk.MaNV
        ${whereSql}
    `, params);

    const itemsR = await db.query(`
        SELECT
            nv.MaNV, nv.TenNV, nv.SDT, nv.GioiTinh, nv.Luong,
            nv.NgayVaoLam, nv.TrangThai, nv.CreatedAt, nv.UpdatedAt,
            tk.TenDangNhap, tk.VaiTro,
            ISNULL((
                SELECT COUNT(*) FROM HoaDon hd WHERE hd.MaNV = nv.MaNV
            ), 0) AS SoHoaDon,
            ISNULL((
                SELECT COUNT(*) FROM PhieuNhap pn WHERE pn.MaNV = nv.MaNV
            ), 0) AS SoPhieuNhap,
            ISNULL((
                SELECT COUNT(*) FROM PhieuChi pc WHERE pc.MaNV = nv.MaNV
            ), 0) AS SoPhieuChi
        FROM NhanVien nv
        LEFT JOIN TaiKhoan tk ON nv.MaNV = tk.MaNV
        ${whereSql}
        ORDER BY nv.MaNV DESC
        OFFSET ${offset} ROWS FETCH NEXT ${safeLimit} ROWS ONLY
    `, params);

    const items = itemsR.recordset.map((r) => ({
        ...r,
        SoHoaDon: Number(r.SoHoaDon) || 0,
        SoPhieuNhap: Number(r.SoPhieuNhap) || 0,
        SoPhieuChi: Number(r.SoPhieuChi) || 0,
    }));
    return { items, total: countR.recordset[0].total };
}

async function getById(maNV) {
    // Lấy thông tin NV + stats aggregate (HĐ, PN, PC, tổng bán)
    const r = await db.query(`
        WITH Stats AS (
            SELECT
                (SELECT COUNT(*) FROM HoaDon hd WHERE hd.MaNV = nv.MaNV) AS SoHoaDon,
                (SELECT ISNULL(SUM(hd.TongTien),0) FROM HoaDon hd WHERE hd.MaNV = nv.MaNV AND hd.TrangThai = N'DaThanhToan') AS TongBan,
                (SELECT COUNT(*) FROM PhieuNhap pn WHERE pn.MaNV = nv.MaNV) AS SoPhieuNhap,
                (SELECT ISNULL(SUM(l.SoLuongNhap*l.GiaNhap),0)
                    FROM LoThuoc_ChiTietNhap l
                    INNER JOIN PhieuNhap pn ON l.MaPN = pn.MaPN
                    WHERE pn.MaNV = nv.MaNV) AS TongNhap,
                (SELECT COUNT(*) FROM PhieuChi pc WHERE pc.MaNV = nv.MaNV) AS SoPhieuChi,
                (SELECT ISNULL(SUM(pc.SoTien),0) FROM PhieuChi pc WHERE pc.MaNV = nv.MaNV) AS TongChi
            FROM NhanVien nv WHERE nv.MaNV = @maNV
        )
        SELECT nv.MaNV, nv.TenNV, nv.SDT, nv.GioiTinh, nv.Luong, nv.NgayVaoLam,
               nv.TrangThai, nv.CreatedAt, nv.UpdatedAt,
               tk.TenDangNhap, tk.VaiTro,
               s.SoHoaDon, s.TongBan, s.SoPhieuNhap, s.TongNhap, s.SoPhieuChi, s.TongChi
        FROM NhanVien nv
        LEFT JOIN TaiKhoan tk ON nv.MaNV = tk.MaNV
        CROSS JOIN Stats s
        WHERE nv.MaNV = @maNV
    `, { maNV });
    if (!r.recordset[0]) return null;
    const row = r.recordset[0];
    return {
        ...row,
        SoHoaDon: Number(row.SoHoaDon) || 0,
        TongBan: Number(row.TongBan) || 0,
        SoPhieuNhap: Number(row.SoPhieuNhap) || 0,
        TongNhap: Number(row.TongNhap) || 0,
        SoPhieuChi: Number(row.SoPhieuChi) || 0,
        TongChi: Number(row.TongChi) || 0,
    };
}

/**
 * Lịch sử hóa đơn đã thanh toán của 1 NV (mới nhất trước).
 */
async function getHoaDonByNV(maNV, limit = 10) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const r = await db.query(`
        SELECT TOP (@limit)
            hd.MaHD, hd.NgayGioLap, hd.TrangThai, hd.TongTien,
            ISNULL((
                SELECT COUNT(*) FROM ChiTietHoaDon ct WHERE ct.MaHD = hd.MaHD
            ), 0) AS SoMatHang,
            ISNULL((
                SELECT SUM(ct.SoLuongBan) FROM ChiTietHoaDon ct WHERE ct.MaHD = hd.MaHD
            ), 0) AS TongSoLuong,
            kh.TenKH
        FROM HoaDon hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        WHERE hd.MaNV = @maNV
          AND hd.TrangThai = N'DaThanhToan'
        ORDER BY hd.NgayGioLap DESC
    `, { maNV, limit: safeLimit });

    return r.recordset.map((row) => ({
        ...row,
        TongTien: Number(row.TongTien) || 0,
        SoMatHang: Number(row.SoMatHang) || 0,
        TongSoLuong: Number(row.TongSoLuong) || 0,
    }));
}

/**
 * Lịch sử phiếu nhập đã lập của 1 NV (mới nhất trước).
 */
async function getPhieuNhapByNV(maNV, limit = 10) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const r = await db.query(`
        SELECT TOP (@limit)
            pn.MaPN, pn.NgayNhap, pn.TrangThai,
            ncc.TenNCC,
            ISNULL((
                SELECT COUNT(*) FROM LoThuoc_ChiTietNhap l WHERE l.MaPN = pn.MaPN
            ), 0) AS SoLo,
            ISNULL((
                SELECT SUM(l.SoLuongNhap) FROM LoThuoc_ChiTietNhap l WHERE l.MaPN = pn.MaPN
            ), 0) AS TongSoLuong,
            ISNULL((
                SELECT SUM(l.SoLuongNhap * l.GiaNhap)
                FROM LoThuoc_ChiTietNhap l WHERE l.MaPN = pn.MaPN
            ), 0) AS TongTien
        FROM PhieuNhap pn
        LEFT JOIN NhaCungCap ncc ON pn.MaNCC = ncc.MaNCC
        WHERE pn.MaNV = @maNV
        ORDER BY pn.MaPN DESC
    `, { maNV, limit: safeLimit });

    return r.recordset.map((row) => ({
        ...row,
        SoLo: Number(row.SoLo) || 0,
        TongSoLuong: Number(row.TongSoLuong) || 0,
        TongTien: Number(row.TongTien) || 0,
    }));
}

/**
 * Thống kê tổng quan NV cho 4 stat cards.
 */
async function getStats() {
    const [tongR, dangLamR, coTK, moiR, vaiTroR, gioiTinhR] = await Promise.all([
        db.query(`SELECT COUNT(*) AS total FROM NhanVien`),
        db.query(`SELECT COUNT(*) AS total FROM NhanVien WHERE TrangThai = N'DangLam'`),
        db.query(`
            SELECT COUNT(DISTINCT nv.MaNV) AS total FROM NhanVien nv
            INNER JOIN TaiKhoan tk ON tk.MaNV = nv.MaNV
        `),
        // NV mới trong 30 ngày (dựa theo NgayVaoLam)
        db.query(`
            SELECT COUNT(*) AS total FROM NhanVien
            WHERE NgayVaoLam IS NOT NULL AND NgayVaoLam >= DATEADD(DAY, -30, GETDATE())
        `),
        // Đếm theo vai trò
        db.query(`
            SELECT
                ISNULL(SUM(CASE WHEN tk.VaiTro = N'Admin' THEN 1 ELSE 0 END), 0) AS Admin,
                ISNULL(SUM(CASE WHEN tk.VaiTro = N'NV_BanHang' THEN 1 ELSE 0 END), 0) AS BanHang,
                ISNULL(SUM(CASE WHEN tk.VaiTro = N'NV_Kho' THEN 1 ELSE 0 END), 0) AS Kho,
                ISNULL(SUM(CASE WHEN tk.VaiTro NOT IN (N'Admin', N'NV_BanHang', N'NV_Kho') THEN 1 ELSE 0 END), 0) AS Khac
            FROM TaiKhoan tk
        `),
        // Đếm theo giới tính
        db.query(`
            SELECT
                ISNULL(SUM(CASE WHEN GioiTinh = N'Nam' THEN 1 ELSE 0 END), 0) AS Nam,
                ISNULL(SUM(CASE WHEN GioiTinh = N'Nữ' THEN 1 ELSE 0 END), 0) AS Nu,
                ISNULL(SUM(CASE WHEN GioiTinh NOT IN (N'Nam', N'Nữ') OR GioiTinh IS NULL THEN 1 ELSE 0 END), 0) AS Khac
            FROM NhanVien
        `),
    ]);

    const vt = vaiTroR.recordset[0] || {};
    const gt = gioiTinhR.recordset[0] || {};
    return {
        tongNhanVien: tongR.recordset[0].total,
        dangLam: dangLamR.recordset[0].total,
        coTaiKhoan: coTK.recordset[0].total,
        moi30Ngay: moiR.recordset[0].total,
        vaiTro: {
            Admin: Number(vt.Admin) || 0,
            NV_BanHang: Number(vt.BanHang) || 0,
            NV_Kho: Number(vt.Kho) || 0,
            Khac: Number(vt.Khac) || 0,
        },
        gioiTinh: {
            Nam: Number(gt.Nam) || 0,
            Nu: Number(gt.Nu) || 0,
            Khac: Number(gt.Khac) || 0,
        },
    };
}

async function create(data) {
    const r = await db.query(
        `INSERT INTO NhanVien (TenNV, SDT, GioiTinh, Luong, NgayVaoLam, TrangThai)
         OUTPUT INSERTED.MaNV, INSERTED.TenNV, INSERTED.SDT, INSERTED.GioiTinh, INSERTED.Luong, INSERTED.NgayVaoLam, INSERTED.TrangThai, INSERTED.CreatedAt, INSERTED.UpdatedAt
         VALUES (@tenNV, @sdt, @gioiTinh, @luong, @ngayVaoLam, @trangThai)`,
        {
            tenNV: data.tenNV,
            sdt: data.sdt || null,
            gioiTinh: data.gioiTinh || null,
            luong: data.luong || 0,
            ngayVaoLam: data.ngayVaoLam || new Date().toISOString().split('T')[0],
            trangThai: data.trangThai || 'DangLam'
        }
    );
    return r.recordset[0];
}

async function update(maNV, data) {
    const r = await db.query(
        `UPDATE NhanVien
         SET TenNV = @tenNV, SDT = @sdt, GioiTinh = @gioiTinh, Luong = @luong, TrangThai = @trangThai, UpdatedAt = GETDATE()
         OUTPUT INSERTED.MaNV, INSERTED.TenNV, INSERTED.SDT, INSERTED.GioiTinh, INSERTED.Luong, INSERTED.NgayVaoLam, INSERTED.TrangThai, INSERTED.CreatedAt, INSERTED.UpdatedAt
         WHERE MaNV = @maNV`,
        {
            maNV,
            tenNV: data.tenNV,
            sdt: data.sdt || null,
            gioiTinh: data.gioiTinh || null,
            luong: data.luong || 0,
            trangThai: data.trangThai || 'DangLam'
        }
    );
    return r.recordset[0] || null;
}

async function remove(maNV) {
    const tkR = await db.query(`SELECT COUNT(*) AS cnt FROM TaiKhoan WHERE MaNV = @maNV`, { maNV });
    if (tkR.recordset[0].cnt > 0) {
        const err = new Error(`Không thể xóa: nhân viên đang có ${tkR.recordset[0].cnt} tài khoản. Xóa tài khoản trước.`);
        err.statusCode = 409;
        throw err;
    }

    const r = await db.query(`DELETE FROM NhanVien WHERE MaNV = @maNV`, { maNV });
    return r.rowsAffected[0] > 0;
}

module.exports = {
    getAll,
    getById,
    getHoaDonByNV,
    getPhieuNhapByNV,
    getStats,
    create,
    update,
    remove,
};
