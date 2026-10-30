require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

// صفحة الفحص للتأكد من أن السيرفر يعمل
app.get('/', (req, res) => {
    res.send('AMRORO AI Local Backend is Online!');
});

// مسار التوليد والبناء (Generate)
app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt;
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.groq_api_key}`
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: "You are an expert Roblox Luau script generator. Return ONLY valid executable Luau code inside a code block ```lua ... ```." },
                    { role: "user", content: userPrompt }
                ]
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const aiText = data.choices[0].message.content;
            // استخراج الكود البرمجي بذكاء
            let codeMatch = aiText.match(/```lua([\s\S]*?)```/) || aiText.match(/```([\s\S]*?)```/);
            let finalCode = codeMatch ? codeMatch[1] : '-- No code found\nlocal p = Instance.new("Part"); p.Parent = workspace;';
            
            return res.json({ code: finalCode, elapsedTimeSec: "0.5" });
        } else {
            return res.json({ code: 'error("Groq API Error")' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// مسار الشات (Chat)
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.groq_api_key}`
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: "You are AMRORO AI, an expert Roblox Studio assistant." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return res.json({ reply: data.choices[0].message.content });
        } else {
            return res.json({ reply: "API Error occurred." });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// مسار الإصلاح التلقائي (Auto-Fix)
app.post('/auto-fix', async (req, res) => {
    const errorLog = req.body.fullOutputLog;
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.groq_api_key}`
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: "Fix this Roblox Luau script error and return ONLY valid Luau code inside ```lua ... ```." },
                    { role: "user", content: "Fix error: " + errorLog }
                ]
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const aiText = data.choices[0].message.content;
            let codeMatch = aiText.match(/```lua([\s\S]*?)```/) || aiText.match(/```([\s\S]*?)```/);
            let finalCode = codeMatch ? codeMatch[1] : '';
            return res.json({ code: finalCode });
        } else {
            return res.json({ code: '' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AMRORO Local Server running on port ${PORT}`);
});