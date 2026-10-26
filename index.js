const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('AMRORO AI Cloud Backend is Online for Mahmoud & Mohammed!');
});

app.post('/api/amroro', async (req, res) => {
    const userPrompt = req.body.prompt;
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.groq_api_key}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are AMRORO, an expert Roblox Studio AI assistant created by Mahmoud and Mohammed." },
                    { role: "user", content: userPrompt }
                ]
            })
        });
        
        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            return res.status(200).json({ reply: "Groq API Error: " + JSON.stringify(data) });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = app;