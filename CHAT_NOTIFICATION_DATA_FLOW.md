# Gửi tin nhắn (realtime)
client --socket--> messageHandler --> messageService --> DB
                                  └-> emitToRoom (socketGateway)

# Gửi tin nhắn (HTTP fallback)
client --REST--> messageController --> messageService --> DB
                                   └-> emitToRoom (socketGateway)

# Tạo notification từ hệ thống (vd: assign task)
taskController --> notificationService --> DB
                                      └-> emitToUser (socketGateway)

# Client đọc notification
client --socket--> notificationHandler --> update DB --> emit lại về user