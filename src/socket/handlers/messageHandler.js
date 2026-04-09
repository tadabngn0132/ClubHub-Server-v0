export const setupMessageHandler = (io, socket) => {
    /**
     * Listen for message:send
     * -> Validate
     * -> Check membership
     * -> Save to DB
     * -> Emit to room + receiver
     * 
     * Listen for message:update
     * -> Check ownership
     * -> Update in DB
     * -> Emit to room
     * 
     * Listen for message:delete
     * -> Check ownership
     * -> Soft delete in DB
     * -> Emit to room
    */
}