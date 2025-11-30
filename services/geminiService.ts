import { GoogleGenAI, Type } from "@google/genai";
import { ChartDataSchema } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTextResponse = async (
  prompt: string,
  systemInstruction?: string,
  imagePart?: { data: string; mimeType: string },
  isFinancial: boolean = false
) => {
  try {
    // Use gemini-2.5-flash-lite for low latency responses as requested
    // Financial mode retains standard flash for specific structured data capabilities, 
    // while other modes use the lightweight model for speed.
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

    // If financial, try to get structured data for charts + text
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
  try {
    // Prepend explicit instruction to ensure the model generates an image and doesn't just chat
    const fullPrompt = `Generate a high-quality image of: ${prompt}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, 
          // imageSize not supported for flash-image, only pro-image-preview
        }
      }
    });
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    let imageData = null;
    let textMessage = "";

    // Iterate through all parts to find the image. 
    // The model might return text ("Here is your image") AND the image.
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

    // If no image found, then the text message is likely a refusal or error explanation
    if (textMessage) {
      throw new Error(textMessage);
    }

    throw new Error("No image data found in response. The model may have refused the request.");
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    throw error;
  }
};

export const generateMusic = async (prompt: string) => {
  try {
    // Use TTS model as native-audio is not supported for generateContent in this context
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
        data: part.inlineData.data, // Base64 string
        mimeType: part.inlineData.mimeType || 'audio/pcm' // Likely audio/pcm
      };
    }
    throw new Error("No audio generated.");
  } catch (error) {
    console.error("AI Music Generation Error:", error);
    throw error;
  }
};

export const findYoutubeVideo = async (query: string): Promise<{videoId: string, title: string} | null> => {
  try {
    // Cannot use responseMimeType: "application/json" with tools like googleSearch.
    // Instead, we ask for a strict text format and parse it.
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
        // responseMimeType removed to avoid 400 error
      }
    });

    const text = response.text || "";
    
    // Parse the custom format
    const idMatch = text.match(/VIDEO_ID:\s*([a-zA-Z0-9_-]{11})/);
    const titleMatch = text.match(/TITLE:\s*(.+)/);

    if (idMatch) {
         return { 
             videoId: idMatch[1], 
             title: titleMatch ? titleMatch[1].trim() : query 
         };
    }
    
    // Fallback: Check for URL in the text if the model returned a link instead of strict format
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const urlMatch = text.match(urlRegex);
    
    if (urlMatch) {
         return { 
             videoId: urlMatch[1], 
             title: titleMatch ? titleMatch[1].trim() : query 
         };
    }

    return null;

  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
};

export const getLiveClient = () => {
  return ai.live;
};