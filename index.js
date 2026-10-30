require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

// صفحة الفحص للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.status(200).send('AMRORO AI Vercel Backend is Online!');
});

// مسار التوليد وبناء الألعاب (Generate)
app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt;
    try {
        const response = validateAndFetchGroq(userPrompt);
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const aiText = data.choices[0].message.content;
            let codeMatch = aiText.match(/```lua([\s\S]*?)```/) || aiText.match(/```([\s\S]*?)```/);
            let finalCode = codeMatch ? codeMatch[1] : '-- No code found';
            return res.json({ code: finalCode, elapsedTimeSec: "1.2" });
        } else {
            return res.json({ code: 'error("API Error")' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

async function validateAndFetchGroq(promptText) {
    return await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.groq_api_key}`
        },
        body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: "You are an expert Roblox Luau script generator. Return ONLY valid executable Luau code inside a code block ```lua ... ```." },
                { role: "user", content: promptText }
            ]
        })
    });
}

// تصدير التطبيق ليعمل مع Vercel Serverless
module.exports = app;