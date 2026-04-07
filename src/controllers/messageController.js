import {
  createNewMessageService,
  updateMessageService,
  getAllMessagesByRoomIdService,
  softDeleteMessageService,
  hardDeleteMessageService,
} from "../services/messageService.js";

export const createNewMessage = async (req, res) => {
  const { roomId, receiverId, content } = req.body;
  const senderId = req.userId;

  try {
    const newMessage = await createNewMessageService(
      roomId,
      receiverId,
      content,
      senderId,
    );
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  try {
    const updatedMessage = await updateMessageService(
      messageId,
      content,
      userId,
    );

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Unauthorized to edit this message") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

export const getAllMessagesByRoomId = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.userId;

  try {
    const messages = await getAllMessagesByRoomIdService(roomId, userId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

export const softDeleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  try {
    const deletedMessage = await softDeleteMessageService(messageId, userId);

    res.status(200).json({
      success: true,
      message: "Message soft deleted successfully",
      data: deletedMessage,
    });
  } catch (error) {
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Unauthorized to delete this message") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error soft deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to soft delete message",
    });
  }
};

export const hardDeleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  try {
    await hardDeleteMessageService(messageId, userId);

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Unauthorized to delete this message") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message",
    });
  }
};
