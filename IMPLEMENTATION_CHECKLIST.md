# 🚀 AI Gemini Integration - Quick Implementation Guide

**Status**: Ready to implement  
**Created**: March 25, 2026

---

## What's Been Created For You ✅

Three files have been generated to help you integrate Gemini AI:

1. **`src/services/aiService.js`** - Core AI service with:
   - `generateContent()` - Basic content generation
   - `generateWithOptions()` - Advanced generation with custom parameters
   - `safeAICall()` - Retry mechanism for reliability
   - Pre-configured system instructions for different use cases

2. **`src/routes/aiRoute.js`** - API endpoints:
   - `POST /api/ai/generate` - Generic content generation
   - `POST /api/ai/activity-recommendation` - Activity suggestions
   - `POST /api/ai/event-description` - Event descriptions
   - `POST /api/ai/draft-message` - Message drafting
   - `POST /api/ai/plan-task` - Task planning
   - `POST /api/ai/generate-advanced` - Advanced options
   - `GET /api/ai/health` - Health check

3. **`AI_INTEGRATION_GUIDELINE.md`** - Comprehensive documentation (already in your folder)

---

## ⚡ 3 Simple Steps to Complete Integration

### STEP 1: Add Import to `server.js` (Line 27)

Go to `server.js` and add this import line:

```javascript
import messageRoute from "./src/routes/messageRoute.js";
import aiRouter from "./src/routes/aiRoute.js"; // ← ADD THIS LINE
```

After the line:

```javascript
import messageRoute from "./src/routes/messageRoute.js";
```

---

### STEP 2: Register Route in `server.js` (Line 70)

In the same file, find this section:

```javascript
app.use("/api/messages", messageRoute);
```

And add this line right after it:

```javascript
app.use("/api/ai", aiRouter); // ← ADD THIS LINE
```

---

### STEP 3: Verify `.env` File

Make sure your `.env` file has:

```env
GEMINI_API_KEY=your_actual_api_key_here
# Optional backup key
BACKUP_GEMINI_API_KEY=your_backup_api_key_here
```

**Don't have an API key?** Get one free at: https://aistudio.google.com/apikey

---

## 🧪 Test It (5 minutes)

### Quick Test with cURL:

```bash
curl -X GET http://localhost:3000/api/ai/health
```

Expected response:

```json
{
  "success": true,
  "message": "AI Service is running",
  "timestamp": "2026-03-25T..."
}
```

### Test Generation:

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Suggest 3 fun training activities for hip-hop dancers",
    "type": "activity_recommender"
  }'
```

### Using Postman? Use this:

- **Method**: POST
- **URL**: `http://localhost:3000/api/ai/generate`
- **Body** (JSON):

```json
{
  "prompt": "Create an event announcement for a dance competition",
  "type": "content_generator"
}
```

---

## 📋 Available AI Features

| Endpoint                          | Purpose              | Use Case                            |
| --------------------------------- | -------------------- | ----------------------------------- |
| `/api/ai/generate`                | General content      | Any prompt-based task               |
| `/api/ai/activity-recommendation` | Activity suggestions | "What should this member train?"    |
| `/api/ai/event-description`       | Event descriptions   | Generate engaging event posts       |
| `/api/ai/draft-message`           | Message composition  | Draft announcements, notifications  |
| `/api/ai/plan-task`               | Task breakdown       | Planning events, projects           |
| `/api/ai/generate-advanced`       | Custom parameters    | Fine-tuned control over AI behavior |

---

## 🎯 Next Steps (Optional Enhancements)

After basic setup works, consider:

1. **Add Authentication Middleware**
   - Uncomment `authMiddleware` in `aiRoute.js` to require login

2. **Integrate with DB**
   - Save AI-generated content to database
   - Track usage and costs

3. **Custom Prompts for Your App**
   - Modify `SYSTEM_INSTRUCTIONS` in `aiService.js`
   - Add more endpoint types for specific features

4. **Error Handling**
   - Implement retry logic for production
   - Monitor API quota usage
   - Set up alerts for failures

5. **Frontend Integration**
   - Add AI endpoints to your React frontend
   - Display AI suggestions in activity details
   - Auto-generate event descriptions in creation forms

---

## ❓ Common Questions

**Q: Do I need to authenticate to use AI endpoints?**  
A: Not required by default, but you should add it. Uncomment the `authMiddleware` comment in `aiRoute.js` for production.

**Q: How much does Gemini API cost?**  
A: Free tier includes 1,500 requests/day. For production, check Google AI Studio pricing.

**Q: Can I use different AI models?**  
A: Yes, modify `model: "gemini-3-flash-preview"` in `aiService.js` to use other models.

**Q: What if I get API errors?**  
A: Check `.env` file, verify API key is valid, check your quota on aistudio.google.com

---

## 📞 Need Help?

1. Check `AI_INTEGRATION_GUIDELINE.md` for detailed docs
2. Review error messages - they're descriptive
3. Test with the `/api/ai/health` endpoint first
4. Check `.env` configuration

---

**Implementation Time**: ~5 minutes  
**Testing Time**: ~10 minutes  
**Ready to go!** ✨
