import {
    createMessageService,
    getMessagesByChatRoomIdService,
    updateMessageService,
    softDeleteMessageService,
    hardDeleteMessageService
} from '../services/messageService.js';

export const createMessage = (req, res) => {
    // Logic to create a message
}

export const getMessagesByChatRoomId = (req, res) => {
    // Logic to get all messages by chat room ID
}

export const updateMessage = (req, res) => {
    // Logic to update a message
}

export const softDeleteMessage = (req, res) => {
    // Logic to soft delete a message
}

export const hardDeleteMessage = (req, res) => {
    // Logic to hard delete a message
}