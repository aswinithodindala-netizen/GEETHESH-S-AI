import { GoogleGenAI, Type } from "@google/genai";
import { ChartDataSchema } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if we should use backend (you can toggle this based on env vars or build mode)
// For this setup, we assume if we are in a browser environment, we try to hit the relative /api path
const USE_BACKEND = true; 

export const generateTextResponse = async (
  prompt: string,
  systemInstruction?: string,
  imagePart?: { data: string; mimeType: string },
  isFinancial: boolean = false
) => {
  if (USE_BACKEND) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          systemInstruction, 
          isFinancial,
          imagePart // Pass image data if needed, backend needs to handle it (server/index.js updated to handle basic text for now)
        })
      });
      if (!response.ok) throw new Error('Backend request failed');
      const data = await response.json();
      return data.text;
    } catch (e) {
      console.warn("Backend failed, falling back to direct SDK:", e);
      // Fallback to SDK below
    }
  }

  try {
    const model = isFinancial ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite';
    
    const parts: any[] = [];
    if (imagePart) {
      parts.push({
        inlineData: {
          data: imagePart.data,
          mimeType: imagePart.mimeType
        }
      });
    }
    parts.push({ text: prompt });

    const config: any = {
      systemInstruction,
    };

    if (isFinancial) {
      config.responseMimeType = "application/json";
      config.responseSchema = ChartDataSchema;
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config
    });

    return response.text;
  } catch (error) {
    console.error("AI Text Generation Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  if (USE_BACKEND) {
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio })
      });
      if (!response.ok) throw new Error('Backend request failed');
      const data = await response.json();
      return data.url;
    } catch (e) {
      console.warn("Backend failed, falling back to direct SDK:", e);
    }
  }

  try {
    const fullPrompt = `Generate a high-quality image of: ${prompt}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, 
        }
      }
    });
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    let imageData = null;
    let textMessage = "";

    for (const part of parts) {
      if (part.inlineData) {
        imageData = `data:image/png;base64,${part.inlineData.data}`;
      }
      if (part.text) {
        textMessage += part.text;
      }
    }

    if (imageData) {
      return imageData;
    }

    if (textMessage) {
      // Sometimes the model explains why it can't generate
      console.warn("Model text response:", textMessage);
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    throw error;
  }
};

export const generateMusic = async (prompt: string) => {
  // TTS/Music generation is currently not in the simple backend example, so we keep direct SDK usage
  // or you could add /api/music/generate to server/index.js similarly.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'audio/pcm'
      };
    }
    throw new Error("No audio generated.");
  } catch (error) {
    console.error("AI Music Generation Error:", error);
    throw error;
  }
};

export const findYoutubeVideo = async (query: string): Promise<{videoId: string, title: string} | null> => {
  if (USE_BACKEND) {
    try {
      const response = await fetch('/api/music/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!response.ok) throw new Error('Backend request failed');
      const data = await response.json();
      // The backend returns the raw text from the AI, we still need to parse it here 
      // OR update backend to return parsed JSON. 
      // For now, let's parse the text returned by backend.
      return parseSearchResponse(data.text, query);
    } catch (e) {
      console.warn("Backend failed, falling back to direct SDK:", e);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [{ 
          text: `Find the official YouTube video for the song "${query}". 
          Provide the 11-character Video ID and the official Title.
          
          You MUST output the result in this exact format:
          VIDEO_ID: <THE_11_CHAR_ID>
          TITLE: <THE_VIDEO_TITLE>
          
          Do not add any other text or JSON.` 
        }] 
      },
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    return parseSearchResponse(text, query);

  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
};

// Helper to parse the AI text response for video ID and title
function parseSearchResponse(text: string, query: string) {
    const idMatch = text.match(/VIDEO_ID:\s*([a-zA-Z0-9_-]{11})/);
    const titleMatch = text.match(/TITLE:\s*(.+)/);

    if (idMatch) {
         return { 
             videoId: idMatch[1], 
             title: titleMatch ? titleMatch[1].trim() : query 
         };
    }
    
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const urlMatch = text.match(urlRegex);
    
    if (urlMatch) {
         return { 
             videoId: urlMatch[1], 
             title: titleMatch ? titleMatch[1].trim() : query 
         };
    }
    return null;
}

export const getLiveClient = () => {
  // Live API requires WebSocket and complex proxying, so we stick to Direct SDK for now.
  // This means the API KEY is still required in the frontend for this specific feature.
  return ai.live;
};