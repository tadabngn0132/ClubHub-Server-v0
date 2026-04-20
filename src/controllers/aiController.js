import { generateResponse } from '../services/aiService.js';

export const generateAIResponse = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const aiResponse = await generateResponse(prompt);

    res.json({
      success: true,
      message: "AI response generated successfully",
      data: { response: aiResponse },
    });
  } catch (error) {
    return next(error);
  }
};
