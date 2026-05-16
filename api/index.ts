import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Please set it in your environment variables (Vercel dashboard or .env file).");
  }
  return new OpenAI({ apiKey });
};

// API Routes
app.post("/api/analyze-meal", async (req, res) => {
  try {
    const { image, prompt } = req.body;
    if (!image) return res.status(400).json({ error: "Image data is required" });

    const openai = getOpenAI();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Meal analysis error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/analyze-patterns", async (req, res) => {
  try {
    const { text, prompt } = req.body;
    if (!text) return res.status(400).json({ error: "Readings text is required" });

    const openai = getOpenAI();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nUSER DATA:\n${text}`,
        },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Pattern analysis error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default app;
