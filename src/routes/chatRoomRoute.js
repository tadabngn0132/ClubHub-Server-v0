import express from "express";
import {
    createChatRoom,
    getChatRooms,
    getChatRoomById,
    getChatRoomsByUserId,
    updateChatRoom,
    deleteChatRoom,
} from '../controllers/chatRoomController.js';

const router = express.Router();

router.post('/', createChatRoom);
router.get('/', getChatRooms);
router.get('/user/:userId', getChatRoomsByUserId);
router.get('/:id', getChatRoomById);
router.put('/:id', updateChatRoom);
router.delete('/:id', deleteChatRoom);

export default router;