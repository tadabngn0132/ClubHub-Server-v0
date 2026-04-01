import express from "express";
import {
    createChatRoom,
    getChatRooms,
    getChatRoomById,
    getChatRoomsByUserId,
    updateChatRoom,
    deleteChatRoom,
    createManyChatRooms,
    getManyChatRooms,
    updateManyChatRooms,
    deleteManyChatRooms,
} from '../controllers/chatRoomController.js';

const router = express.Router();

router.post('/many/create', createManyChatRooms);
router.post('/many/get', getManyChatRooms);
router.put('/many/update', updateManyChatRooms);
router.delete('/many/delete', deleteManyChatRooms);

router.post('/', createChatRoom);
router.get('/', getChatRooms);
router.get('/user/:userId', getChatRoomsByUserId);
router.get('/:id', getChatRoomById);
router.put('/:id', updateChatRoom);
router.delete('/:id', deleteChatRoom);

export default router;