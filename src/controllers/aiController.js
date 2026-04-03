import { generateResponse } from '../services/aiService.js';

export const generateAIResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    const aiResponse = await generateResponse(prompt);

    res.json({
      success: true,
      message: "AI response generated successfully",
      data: { response: aiResponse },
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / Generate AI Response Error: ${error.message}`,
    });
  }
};
