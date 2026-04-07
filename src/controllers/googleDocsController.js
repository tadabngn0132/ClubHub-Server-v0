import {
  createGoogleDocFromTemplate,
  createGoogleDocTemplate,
  getEmbeddableLinkForGoogleDoc,
} from "../services/googleDocsService.js";

export const createGoogleDocFromExistingTemplate = async (req, res) => {
  try {
    const { userId, templateId, newDocTitle } = req.body;

    const newDoc = await createGoogleDocFromTemplate(
      userId,
      templateId,
      newDocTitle,
    );

    res.status(201).json({
      success: true,
      message: "Google Doc created from template successfully",
      data: newDoc,
    });
  } catch (err) {
    console.error("Error creating Google Doc from template:", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create Google Doc from template error: ${err.message}`,
    });
  }
};

export const createNewGoogleDocTemplate = async (req, res) => {
  try {
    const { userId, title } = req.body;

    const newDocTemplate = await createGoogleDocTemplate(userId, title);

    res.status(201).json({
      success: true,
      message: "Google Doc template created successfully",
      data: newDocTemplate,
    });
  } catch (err) {
    console.error("Error creating Google Doc template:", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create Google Doc template error: ${err.message}`,
    });
  }
};

export const getGoogleDocEmbedLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;
    const embedLink = await getEmbeddableLinkForGoogleDoc(userId, documentId);

    res.json({
      success: true,
      message: "Embeddable link retrieved successfully",
      data: { embedLink },
    });
  } catch (err) {
    console.error(
      "Error retrieving embeddable link for Google Doc:",
      err.message,
    );
    res.status(500).json({
      success: false,
      message: `Internal server error / Get embeddable link for Google Doc error: ${err.message}`,
    });
  }
};
