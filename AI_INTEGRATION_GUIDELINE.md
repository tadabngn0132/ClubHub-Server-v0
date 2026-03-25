# AI Gemini Integration Guide for ClubHub Server

## 🎯 Overview

This guide explains how to integrate Google Gemini AI into your ClubHub server for intelligent features like activity recommendations, member communication assistance, and automated content generation.

---

## ✅ Prerequisites

- **Google API Key**: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **Node.js**: v18 or higher
- **Package**: `@google/genai` (already installed in `package.json`)
- **Environment Variables**: GEMINI_API_KEY configured in `.env`

---

## 🚀 Current Setup Status

### Already Configured ✓

- ✅ `@google/genai` dependency installed (v1.44.0)
- ✅ Basic Gemini client initialized in `src/libs/googleGenAI.js`
- ✅ Environment variables defined in README
- ✅ System instruction template created

### What's in `src/libs/googleGenAI.js`

```javascript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.BACKUP_GEMINI_API_KEY,
});
```

---

## 📋 Step-by-Step Implementation

### Step 1: Get Your Gemini API Key (if not done)

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add to `.env` file:

```env
GEMINI_API_KEY=your_actual_api_key_here
BACKUP_GEMINI_API_KEY=your_backup_api_key_here
```

### Step 2: Create AI Service Module (Recommended)

Create a new service file: `src/services/aiService.js`

This will be your centralized AI handler:

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.BACKUP_GEMINI_API_KEY,
});

// Define different system instructions for different use cases
const SYSTEM_INSTRUCTIONS = {
  activity_recommender: `You are an activity recommendation assistant for a dance crew management system. 
    Help suggest activities, training sessions, and performance opportunities based on member profiles and preferences.
    Keep responses concise and actionable.`,

  content_generator: `You are a content generation assistant for a dance crew.
    Help create event descriptions, announcements, training plans, and motivational messages.
    Match the tone to be professional yet engaging for a dance community.`,

  communication_helper: `You are a communication assistant that helps draft messages for members.
    Help with clarity, tone, and professionalism. Keep responses brief and direct.`,

  task_planner: `You are a project planning assistant for event management.
    Help break down complex tasks into actionable steps with timelines.
    Consider resource constraints typical for a volunteer-run dance crew.`,
};

const THINKING_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// Generate content with specified system instruction
export async function generateContent(
  prompt,
  instructionType = "content_generator",
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: THINKING_LEVELS.MEDIUM,
        },
        systemInstruction:
          SYSTEM_INSTRUCTIONS[instructionType] ||
          SYSTEM_INSTRUCTIONS.content_generator,
      },
    });

    return {
      success: true,
      content: response.text,
      model: "gemini-3-flash-preview",
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      success: false,
      error: error.message,
      content: null,
    };
  }
}

// Batch generate content (for multiple items)
export async function generateContentBatch(
  prompts,
  instructionType = "content_generator",
) {
  try {
    const results = await Promise.all(
      prompts.map((prompt) => generateContent(prompt, instructionType)),
    );
    return results;
  } catch (error) {
    console.error("Batch Generation Error:", error);
    throw error;
  }
}

// Fine-tuned generation with temperature control
export async function generateWithOptions(prompt, options = {}) {
  const {
    instructionType = "content_generator",
    temperature = 0.7,
    thinkingLevel = "MEDIUM",
    maxTokens = null,
  } = options;

  try {
    const config = {
      temperature,
      thinkingConfig: {
        thinkingLevel:
          THINKING_LEVELS[thinkingLevel.toUpperCase()] ||
          THINKING_LEVELS.MEDIUM,
      },
      systemInstruction:
        SYSTEM_INSTRUCTIONS[instructionType] ||
        SYSTEM_INSTRUCTIONS.content_generator,
    };

    if (maxTokens) {
      config.maxOutputTokens = maxTokens;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config,
    });

    return {
      success: true,
      content: response.text,
      usage: {
        inputTokens: response.usageMetadata?.inputTokens || 0,
        outputTokens: response.usageMetadata?.outputTokens || 0,
      },
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      success: false,
      error: error.message,
      content: null,
    };
  }
}

export { SYSTEM_INSTRUCTIONS, THINKING_LEVELS };
```

### Step 3: Create AI Routes/Endpoints

Create `src/routes/aiRoute.js`:

```javascript
import express from "express";
import { generateContent, generateWithOptions } from "../services/aiService.js";
import { authMiddleware } from "../middlewares/auth.js"; // Adjust path as needed

const router = express.Router();

// Middleware to authenticate before using AI features
router.use(authMiddleware);

// Generic content generation endpoint
router.post("/generate", async (req, res) => {
  try {
    const { prompt, type = "content_generator" } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const result = await generateContent(prompt, type);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Activity recommendation endpoint
router.post("/activity-recommendation", async (req, res) => {
  try {
    const { memberProfile, preferences } = req.body;

    const prompt = `Based on this member profile:
- Skills: ${memberProfile.skills?.join(", ") || "Not specified"}
- Experience Level: ${memberProfile.experienceLevel || "Unknown"}
- Availability: ${memberProfile.availability || "Not specified"}
- Preferences: ${preferences || "Not specified"}

Recommend 3-5 activities or training sessions that would be suitable.`;

    const result = await generateContent(prompt, "activity_recommender");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendation",
      error: error.message,
    });
  }
});

// Event description generator
router.post("/event-description", async (req, res) => {
  try {
    const { eventName, eventType, date, location, details } = req.body;

    const prompt = `Generate an engaging event description for:
- Event Name: ${eventName}
- Type: ${eventType}
- Date & Location: ${date} at ${location}
- Details: ${details}

Make it professional but exciting for a dance crew audience.`;

    const result = await generateContent(prompt, "content_generator");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate event description",
      error: error.message,
    });
  }
});

// Message draft assistant
router.post("/draft-message", async (req, res) => {
  try {
    const { messageType, topic, recipients, tone = "professional" } = req.body;

    const prompt = `Draft a ${tone} message for ${messageType}:
- Topic: ${topic}
- Recipients: ${recipients}

Keep it concise and actionable.`;

    const result = await generateContent(prompt, "communication_helper");
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to draft message",
      error: error.message,
    });
  }
});

// Advanced generation with custom options
router.post("/generate-advanced", async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const result = await generateWithOptions(prompt, options);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
```

### Step 4: Register AI Routes in Main Server File

In `server.js`, add the AI route:

```javascript
import aiRouter from "./src/routes/aiRoute.js";

// ... other imports and middleware ...

// Add this line with other routes (around line 54 in your current server.js):
app.use("/api/ai", aiRouter);

// ... rest of your routes ...
```

### Step 5: Environment Configuration

Update or verify your `.env` file:

```env
# Gemini API
GEMINI_API_KEY=your_production_api_key
BACKUP_GEMINI_API_KEY=your_backup_api_key
```

---

## 💡 Use Case Examples

### 1. Activity Recommendation System

```javascript
// POST /api/ai/activity-recommendation
{
  "memberProfile": {
    "skills": ["hip-hop", "freestyle"],
    "experienceLevel": "intermediate",
    "availability": "weekends"
  },
  "preferences": "Learn new styles"
}
```

### 2. Event Description Generation

```javascript
// POST /api/ai/event-description
{
  "eventName": "Spring Performance",
  "eventType": "competition",
  "date": "April 15, 2024",
  "location": "City Hall Auditorium",
  "details": "Team showcase and member performances"
}
```

### 3. Message Drafting

```javascript
// POST /api/ai/draft-message
{
  "messageType": "member_notification",
  "topic": "Upcoming training schedule",
  "recipients": "all active members",
  "tone": "professional"
}
```

### 4. Generic Content Generation

```javascript
// POST /api/ai/generate
{
  "prompt": "Create a training plan for hip-hop basics",
  "type": "content_generator"
}
```

---

## 🔒 Security Best Practices

1. **Protect API Keys**
   - Never commit `.env` to version control
   - Use environment variables in production
   - Rotate keys periodically

2. **Rate Limiting**
   - Existing rate limiter in `src/middlewares/rateLimiting.js` applies to AI routes
   - Monitor token usage to avoid high costs

3. **Authentication**
   - AI endpoints require authentication (via `authMiddleware`)
   - Only authenticated members can generate content

4. **Input Validation**
   - Validate prompt length (recommended: < 2000 characters)
   - Sanitize user inputs to prevent injection
   - Check request body for required fields

---

## ⚠️ Error Handling & Troubleshooting

### Common Issues

| Issue                 | Solution                                                 |
| --------------------- | -------------------------------------------------------- |
| "API key not found"   | Check GEMINI_API_KEY in .env file                        |
| "QUOTA_EXCEEDED"      | Wait before making more requests or upgrade API quota    |
| "Invalid model"       | Use "gemini-3-flash-preview" (verify current model name) |
| "Rate limit exceeded" | Implement exponential backoff or increase rate limit     |

### Example Error Handling Controller

```javascript
export async function safeAICall(prompt, instructionType) {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateContent(prompt, instructionType);
      if (result.success) return result;
      lastError = result.error;
    } catch (error) {
      lastError = error;
      // Exponential backoff: wait before retry
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} retries: ${lastError}`,
  };
}
```

---

## 📊 Testing AI Features

### Test with cURL

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "What are 3 fun team-building activities for a dance crew?",
    "type": "activity_recommender"
  }'
```

### Test in Postman

1. Create POST request to `http://localhost:3000/api/ai/generate`
2. Add Authorization header with Bearer token
3. Add JSON body with prompt

---

## 🎓 Advanced Topics

### Custom System Instructions

Modify `SYSTEM_INSTRUCTIONS` in `aiService.js` to match your specific needs:

```javascript
const SYSTEM_INSTRUCTIONS = {
  your_custom_type: `Custom instruction tailored for your use case...`,
};
```

### Temperature Control

- **Low (0.1)**: Deterministic, factual responses
- **Medium (0.7)**: Balanced creativity and accuracy
- **High (1.0)**: Creative, varied responses

### Thinking Levels

- **LOW**: Fast, basic reasoning
- **MEDIUM**: Balanced speed and depth (recommended)
- **HIGH**: Deep analysis (slower, higher cost)

---

## 📝 Next Steps

1. ✅ Create `src/services/aiService.js` with the service code above
2. ✅ Create `src/routes/aiRoute.js` with the route handlers
3. ✅ Register AI routes in `server.js`
4. ✅ Test endpoints with provided examples
5. ✅ Implement error handling for production
6. ✅ Monitor API usage and costs
7. ✅ Integrate AI features into specific features (activity recommendations, etc.)

---

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Google GenAI JS SDK](https://github.com/google/generative-ai-js)
- [ClubHub Repository](../../)

---

**Last Updated**: March 25, 2026  
**Status**: Ready for Implementation
