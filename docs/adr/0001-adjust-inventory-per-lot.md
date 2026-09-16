# Điều chỉnh tồn kho theo từng lô có lịch sử

Tồn khả dụng của một thuốc là tổng từ các lô hợp lệ và hoạt động bán hàng xuất theo FIFO, vì vậy hệ thống không cho ghi đè tổng tồn trên bản ghi thuốc. Sai lệch kiểm kê được điều chỉnh trên một lô cụ thể trong transaction và lưu lịch sử trước/sau, lý do, người thực hiện; hàng nhập mới vẫn phải đi qua phiếu nhập để bảo toàn nguồn gốc, hạn dùng và giá vốn.

## Consequences

- Phiếu nhập đã có điều chỉnh tồn không thể bị hủy, vì việc hủy sẽ làm mất hiệu lực của một thay đổi kiểm kê đã được ghi nhận.
- Điều chỉnh tăng có thể làm tồn lô lớn hơn số lượng nhập ban đầu; chênh lệch được giải thích bằng lịch sử điều chỉnh thay vì sửa số lượng nhập gốc.
