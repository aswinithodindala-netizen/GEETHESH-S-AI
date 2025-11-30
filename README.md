# Geethesh's AI

A comprehensive AI dashboard featuring education tutoring, financial advice, image generation, content writing, and a real-time voice assistant.

## Features

- **Education Hub**: AI tutor for academic subjects.
- **Financial Advisor**: Financial insights and charting.
- **Thumbnail Creator**: AI image generation for thumbnails.
- **Writer & PDF Tool**: Content creation assistant.
- **Music Hub**: AI Music generator and YouTube player.
- **Live Assistant**: Real-time voice and video interaction.
- **PWA Support**: Installable on Android/iOS.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **AI**: Google Gemini API (`@google/genai`).
- **Build Tool**: Vite.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/geethesh-ai.git
    cd geethesh-ai
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure API Key:
    - Create a `.env` file in the root directory.
    - Add your API Key:
      ```env
      API_KEY=your_gemini_api_key_here
      ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open your browser at `http://localhost:5173`.

## Deployment

To build for production:

```bash
npm run build
```

The output will be in the `dist` directory, ready to be deployed to Vercel, Netlify, or any static host.
