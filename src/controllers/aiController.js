import {
  generateContent,
  generateWithOptions,
  safeAICall,
} from "../services/aiService.js";

export const generateContentHandler = async (req, res) => {
  try {
    const { prompt, type = "content_generator" } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Prompt is too long (max 5000 characters)",
      });
    }

    const result = await generateContent(prompt, type);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const recommendActivities = async (req, res) => {
  try {
    const { memberProfile, preferences } = req.body;

    if (!memberProfile) {
      return res.status(400).json({
        success: false,
        message: "Member profile is required",
      });
    }

    const prompt = `Based on this member profile:
    - Skills: ${memberProfile.skills?.join(", ") || "Not specified"}
    - Experience Level: ${memberProfile.experienceLevel || "Unknown"}
    - Availability: ${memberProfile.availability || "Not specified"}
    - Preferences: ${preferences || "Not specified"}

    Recommend 3-5 activities or training sessions that would be suitable. Provide practical and actionable recommendations.`;

    const result = await safeAICall(prompt, "activity_recommender");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendation",
      error: error.message,
    });
  }
};

export const generateEventDescription = async (req, res) => {
  try {
    const { eventName, eventType, date, location, details } = req.body;

    if (!eventName || !eventType) {
      return res.status(400).json({
        success: false,
        message: "Event name and type are required",
      });
    }

    const prompt = `Generate an engaging and professional event description:
    Title: ${eventName}
    Type: ${eventType}
    Date & Location: ${date || "TBD"} at ${location || "TBD"}
    Details: ${details || "General event"}

    Make it exciting for a dance crew audience while keeping it professional.
    Include call-to-action for registrants.`;

    const result = await generateContent(prompt, "content_generator");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Event description error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate event description",
      error: error.message,
    });
  }
};

export const draftMessage = async (req, res) => {
  try {
    const { messageType, topic, recipients, tone = "professional" } = req.body;

    if (!messageType || !topic) {
      return res.status(400).json({
        success: false,
        message: "Message type and topic are required",
      });
    }

    const prompt = `Draft a ${tone} message for ${messageType}:
    Topic: ${topic}
    Recipients: ${recipients || "Team members"}

    Keep it concise, clear, and actionable. Use appropriate language for the dance crew context.`;

    const result = await generateContent(prompt, "communication_helper");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Message draft error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to draft message",
      error: error.message,
    });
  }
};


export const planTask = async (req, res) => {
  try {
    const { taskName, description, deadline, constraints } = req.body;

    if (!taskName || !description) {
      return res.status(400).json({
        success: false,
        message: "Task name and description are required",
      });
    }

    const prompt = `Create an action plan for this task:
    Name: ${taskName}
    Description: ${description}
    Deadline: ${deadline || "Not specified"}
    Constraints: ${constraints || "None"}

    Provide step-by-step breakdown with estimated time for each step. Consider typical resources available for a student dance crew.`;

    const result = await generateContent(prompt, "task_planner");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Task planning error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to plan task",
      error: error.message,
    });
  }
};

export const generateAdvancedContent = async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // Validate options
    if (
      options.temperature &&
      (options.temperature < 0 || options.temperature > 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "Temperature must be between 0 and 2",
      });
    }

    const result = await generateWithOptions(prompt, options);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Advanced generation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const checkHealth = (req, res) => {
  res.json({
    success: true,
    message: "AI Service is running",
    timestamp: new Date().toISOString(),
  });
};
