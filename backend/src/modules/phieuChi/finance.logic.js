function calculateFinanceSummary({
    doanhThu = 0,
    tongChiPhieuChi = 0,
    giaVonDaBan = 0,
    giaTriNhapHang = 0,
} = {}) {
    const revenue = Number(doanhThu) || 0;
    const expenses = Number(tongChiPhieuChi) || 0;
    const costOfGoodsSold = Number(giaVonDaBan) || 0;
    const purchases = Number(giaTriNhapHang) || 0;

    return {
        tongThu: revenue,
        tongChi: expenses,
        soDuTienMat: revenue - expenses,
        doanhThu: revenue,
        giaVonDaBan: costOfGoodsSold,
        loiNhuanBanHang: revenue - costOfGoodsSold,
        giaTriNhapHang: purchases,
    };
}

module.exports = { calculateFinanceSummary };

