const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// مسار استقبال الأوامر من بلجن روبلوكس
app.post('/api/amroro', async (req, res) => {
    const userPrompt = req.body.prompt;
    const provider = req.body.provider || "groq"; // الاختيار بين groq أو gemini

    try {
        if (provider === "groq") {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.groq_api_key}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are AMRORO, an expert Roblox Studio AI assistant created by Mahmoud and Mohammed." },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            const data = await response.json();
            return res.json({ reply: data.choices[0].message.content });

        } else {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.gemini_api_key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "You are AMRORO, an expert Roblox Studio AI assistant created by Mahmoud and Mohammed.\n" + userPrompt }] }]
                })
            });
            const data = await response.json();
            return res.json({ reply: data.candidates[0].content.parts[0].text });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AMRORO Cloud Server running on port ${PORT}`));