export const setupNotificationHandler = (io, socket) => {
    /**
     * Listen for notification:send
     * -> Save to DB
     * -> Emit to recipient
     * 
     * Listen for notification:read
     * -> Check ownership
     * -> Update in DB
     * -> Emit to user
     * 
     * Listen for notification:softDelete
     * -> Check ownership
     * -> Soft delete in DB
     * -> Emit to user
     * 
     * Listen for notification:hardDelete
     * -> Check ownership
     * -> Hard delete in DB
     * -> Emit to user
    */
}