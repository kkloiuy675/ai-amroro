const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// صفحة الفحص للتأكد أن السيرفر يعمل
app.get('/', (req, res) => {
    return res.status(200).send('AMRORO AI Vercel Backend is Online!');
});

// مسار التوليد وبناء الألعاب (Generate)
app.post('/generate', async (req, res) => {
    try {
        const { prompt, model, questionnaireAnswers } = req.body || {};
        let finalPrompt = prompt || "Build a simple game";
        
        if (questionnaireAnswers && Array.isArray(questionnaireAnswers)) {
            for (const qa of questionnaireAnswers) {
                if (qa && qa.answer && typeof qa.answer === 'string' && qa.answer.trim() !== "") {
                    finalPrompt += "\n- " + qa.question + ": " + qa.answer;
                }
            }
        }

        const apiKey = process.env.gemini_api_key || process.env.GEMINI_API_KEY || process.env.groq_api_key;
        if (!apiKey) {
            return res.status(200).json({ code: '-- Error: API Key is missing in Vercel Environment Variables.' });
        }

        const apiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "You are an expert Roblox Luau script generator. Return ONLY valid executable Luau code inside a code block ```lua ... ```. No explanations.\nRequest: " + finalPrompt }]
                }]
            })
        });

        const data = await apiResponse.json();
        const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text ? data.candidates[0].content.parts[0].text : '-- No response from Gemini';
        
        let match = text.match(/```lua([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
        let finalCode = match ? match[1] : text;

        return res.status(200).json({ code: finalCode, elapsedTimeSec: "1.0" });
    } catch (error) {
        return res.status(200).json({ code: '-- Server Error: ' + (error.message || 'Unknown') });
    }
});

// مسار الشات (Chat)
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body || {};
        const apiKey = process.env.gemini_api_key || process.env.GEMINI_API_KEY || process.env.groq_api_key;
        
        const apiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message || "Hello" }] }]
            })
        });

        const data = await apiResponse.json();
        const replyText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text ? data.candidates[0].content.parts[0].text : 'Hello! I am AMRORO AI.';
        return res.status(200).json({ reply: replyText });
    } catch (error) {
        return res.status(200).json({ reply: 'Chat Error: ' + (error.message || 'Unknown') });
    }
});

// مسار الإصلاح التلقائي الحقيقي (Auto-Fix)
app.post('/auto-fix', async (req, res) => {
    try {
        const { prompt, fullOutputLog } = req.body || {};
        const apiKey = process.env.gemini_api_key || process.env.GEMINI_API_KEY || process.env.groq_api_key;
        
        const fixPrompt = "Fix the following Roblox Luau script error based on the context.\nError Log: " + (fullOutputLog || "") + "\nContext/Prompt: " + (prompt || "") + "\nReturn ONLY the fixed valid Luau code inside a code block ```lua ... ```.";

        const apiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fixPrompt }] }]
            })
        });

        const data = await apiResponse.json();
        const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text ? data.candidates[0].content.parts[0].text : '-- No fix generated';
        
        let match = text.match(/```lua([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
        let finalCode = match ? match[1] : text;

        return res.status(200).json({ code: finalCode });
    } catch (error) {
        return res.status(200).json({ code: '-- Auto-Fix Error: ' + (error.message || 'Unknown') });
    }
});

module.exports = app;