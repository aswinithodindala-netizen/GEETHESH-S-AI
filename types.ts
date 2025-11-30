
import { Type } from "@google/genai";

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  EDUCATION = 'EDUCATION',
  FINANCE = 'FINANCE',
  THUMBNAIL = 'THUMBNAIL',
  WRITER = 'WRITER',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  KNOWLEDGE = 'KNOWLEDGE',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64
  isError?: boolean;
  timestamp: number;
  chartData?: any; // For financial charts
}

// For Financial Chart Data
export const ChartDataSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    data: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
        }
      }
    },
    summary: { type: Type.STRING }
  }
};

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface VoiceConfig {
  voiceName: string;
}
