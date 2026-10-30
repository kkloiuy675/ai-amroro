const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// صفحة الفحص للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    return res.status(200).send('AMRORO AI Vercel Backend is Online & Ready!');
});

// مسار التوليد وبناء الألعاب (Generate)
app.post('/generate', async (req, res) => {
    try {
        const { prompt, model, questionnaireAnswers } = req.body;
        let finalPrompt = prompt || "";
        
        if (questionnaireAnswers && Array.isArray(questionnaireAnswers)) {
            for (const qa of questionnaireAnswers) {
                finalPrompt += `\nQ: ${qa.question}\nA: ${qa.answer}`;
            }
        }

        let aiCode = '';

        // التحقق مما إذا كان المستخدم اختار موديل Gemini أو Groq
        if (model && model.toLowerCase().includes('gemini')) {
            const apiKey = process.env.gemini_api_key;
            if (!apiKey) {
                return res.json({ code: '-- Error: gemini_api_key is missing in Vercel Environment Variables.' });
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "You are an expert Roblox Luau script generator. Return ONLY valid executable Luau code inside a code block ```lua ... ```.\nRequest: " + finalPrompt }]
                    }]
                })
            });

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            let match = text.match(/```lua([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
            aiCode = match ? match[1] : '-- No code found\n' + text;

        } else {
            // استخدام Groq كافتراضي
            const apiKey = process.env.groq_api_key;
            if (!apiKey) {
                return res.json({ code: '-- Error: groq_api_key is missing in Vercel Environment Variables.' });
            }

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [
                        { role: "system", content: "You are an expert Roblox Luau script generator. Return ONLY valid executable Luau code inside a code block ```lua ... ```." },
                        { role: "user", content: finalPrompt }
                    ]
                })
            });

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';
            let match = text.match(/```lua([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
            aiCode = match ? match[1] : '-- No code found\n' + text;
        }

        return res.json({ code: aiCode, elapsedTimeSec: "1.2" });
    } catch (error) {
        // إرجاع الخطأ كتعليق لكي لا يفشل الطلب بـ 500
        return res.status(200).json({ code: '-- Server Exception Error: ' + error.message });
    }
});

// مسار الشات (Chat)
app.post('/chat', async (req, res) => {
    try {
        const { message, model } = req.body;
        const useGemini = model && model.toLowerCase().includes('gemini');
        const apiKey = useGemini ? process.env.gemini_api_key : process.env.groq_api_key;
        
        if (!apiKey) {
            return res.json({ reply: 'API key missing in Vercel environment variables.' });
        }

        if (useGemini) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });
            const data = await response.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
            return res.json({ reply: replyText });
        } else {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [{ role: "user", content: message }]
                })
            });
            const data = await response.json();
            const replyText = data.choices?.[0]?.message?.content || 'No response from Groq';
            return res.json({ reply: replyText });
        }
    } catch (error) {
        return res.json({ reply: 'Chat Error: ' + error.message });
    }
});

// مسار الإصلاح التلقائي (Auto-Fix)
app.post('/auto-fix', async (req, res) => {
    res.json({ code: '-- Auto fix ready' });
});

module.exports = app;