import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API
// Ensure API_KEY is set in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- API Routes ---

// Text Generation Endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model, isFinancial } = req.body;
    
    // Choose model based on task
    const modelName = model || (isFinancial ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction,
        responseMimeType: isFinancial ? "application/json" : "text/plain"
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Generate Error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Image Generation Endpoint
app.post('/api/image', async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Generate a high-quality image of: ${prompt}` }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio || "1:1" }
      }
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    let imageData = null;
    for (const part of parts) {
      if (part.inlineData) {
        imageData = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (imageData) {
      res.json({ url: imageData });
    } else {
      res.status(400).json({ error: "No image generated" });
    }
  } catch (error) {
    console.error("Image Gen Error:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// YouTube Search Endpoint (Simulated Logic moved to backend)
app.post('/api/music/search', async (req, res) => {
    // In a real backend, you might use the YouTube Data API here
    // For now, we proxy the Gemini search logic
    try {
        const { query } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: `Find official YouTube video for "${query}". Format: VIDEO_ID: <ID>, TITLE: <TITLE>` }] },
            config: { tools: [{ googleSearch: {} }] }
        });
        res.json({ text: response.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve Static Files (Frontend)
// Assuming 'dist' is the build output directory
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});