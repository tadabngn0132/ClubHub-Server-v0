import {
  createMessageService,
  getMessagesByChatRoomIdService,
  updateMessageService,
  softDeleteMessageService,
  hardDeleteMessageService,
} from "../services/messageService.js";

const handleError = (next, err) => next(err);

export const createMessage = async (req, res, next) => {
  try {
    const messageData = req.body;

    const newMessage = await createMessageService(messageData);
    res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    handleError(next, error);
  }
};

export const getMessagesByChatRoomId = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;
    const requesterId = req.userId;

    const messages = await getMessagesByChatRoomIdService(
      chatRoomId,
      requesterId,
    );
    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    handleError(next, error);
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messageData = req.body;
    const requesterId = req.userId;

    const updatedMessage = await updateMessageService(
      id,
      messageData,
      requesterId,
    );
    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    handleError(next, error);
  }
};

export const softDeleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.userId;

    const deletedMessage = await softDeleteMessageService(id, requesterId);
    res.status(200).json({
      success: true,
      message: "Message soft deleted successfully",
      data: deletedMessage,
    });
  } catch (error) {
    handleError(next, error);
  }
};

export const hardDeleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.userId;

    const hardDeletedMessage = await hardDeleteMessageService(id, requesterId);
    res.status(200).json({
      success: true,
      message: "Message hard deleted successfully",
      data: hardDeletedMessage,
    });
  } catch (error) {
    handleError(next, error);
  }
};
