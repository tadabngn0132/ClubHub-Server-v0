## Socket Server
- Implement lifecycle (connect/disconnect)

## Event Handler
# Implement steps:
0. Rate limiting
    - Cần có rate limit cho event realtime để chống spam/abuse (typing, message:send, notification:send).
    - Không cần dùng y hệt middleware HTTP hiện tại; nên viết socket rate-limit middleware hoặc utility riêng cho socket.

1. Authentication
    - Bắt buộc verify access token trước khi xử lý event quan trọng.
    - Không dùng trực tiếp middleware API (Express req/res/next).
    - Nên tách logic verify token thành hàm dùng chung, rồi bọc lại thành socket middleware (io.use hoặc middleware cho từng event).

2. Authorization
    - Cần kiểm tra quyền thao tác với resource cụ thể (send/delete/update/read).
    - Không dùng trực tiếp permission middleware Express.
    - Nên dùng chung rule quyền (ROLE_PERMISSIONS), nhưng tạo socket guard riêng để kiểm tra quyền theo socket context.

3. Validate payload
    - Bắt buộc validate payload cho từng event.
    - Không dùng trực tiếp validation middleware Express.
    - Nên dùng schema dùng chung (Zod/Joi/custom validator) để HTTP và Socket cùng dùng chung chuẩn dữ liệu.

4. Modify DB
    - Không nên gọi trực tiếp controller HTTP từ socket handler.
    - Nên tách service layer (business logic + Prisma query) dùng chung.
    - Socket handler và HTTP controller chỉ đóng vai trò transport layer, cùng gọi service layer.

5. Ack callback (success/error)
    - Ack là phản hồi trực tiếp cho bên gửi event.
    - Ack không tự động gửi cho bên nhận.
    - Dùng built-in ack của Socket.IO.
    - Chuẩn hóa response ack: success/data/errorCode/message.

6. Broadcast (emit)
    - Broadcast là gửi event + data cho một hoặc nhiều client khác theo scope.
    - Dùng built-in emit của Socket.IO (io.emit, socket.broadcast.emit, io.to(room).emit, socket.to(room).emit).
    - Chỉ broadcast đúng đối tượng cần biết (user room/chat room), tránh io.emit toàn hệ thống nếu không cần.

7. Logging
    - Logging dùng cho debug, audit, monitoring, tracing sự cố production.
    - Log tối thiểu: event name, userId, roomId/resourceId, kết quả success/fail, latency.
    - Không log thông tin nhạy cảm (token, password, dữ liệu bí mật).

8. Error handling
    - Cần chuẩn hóa cách bắt lỗi để không làm crash process.
    - Trả lỗi rõ ràng cho client qua ack hoặc event lỗi chuẩn.
    - Log chi tiết lỗi ở server để phục vụ điều tra.
    - Không trả raw stack trace nội bộ cho client.

9. Suggested flow per event
    - authenticate -> authorize -> validate payload -> service/DB -> ack sender -> broadcast recipients -> log.