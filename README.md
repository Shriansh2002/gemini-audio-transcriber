# 🎙️ Gemini Audio Transcriber

A TypeScript utility that transcribes local audio files (e.g., `.webm`, `.mp3`, `.wav`) using **Google Gemini 1.5 Flash** via the `@google/genai` SDK.

Powered by Google's Gemini API, this script reads an audio file, uploads it, and returns the transcription with minimal setup.

---

## ✨ Features

- ✅ Supports common audio formats: `.webm`, `.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`
- ⚡ Uses **Gemini 1.5 Flash** for fast transcription
- 🗃️ Fully local: no cloud storage or uploads beyond Gemini file API
- 🌱 TypeScript implementation with full type safety
- 🛠️ Modular and maintainable code structure

---

## 📂 Project Structure

```
├── src/               # Source code
│   ├── index.ts      # Main entry point
│   ├── transcriber.ts # Core transcription logic
│   └── utils/        # Utility functions
│       ├── file-helper.ts
│       └── prompt.ts
├── assets/           # Audio files directory
├── dist/            # Compiled JavaScript output
├── .env             # Environment variables
├── tsconfig.json    # TypeScript configuration
├── package.json     # Project dependencies
└── README.md        # This file
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shriansh2002/gemini-audio-transcriber.git
cd gemini-audio-transcriber
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

You can set up your Gemini API key in one of two ways:

1. **Environment Variable** (Recommended for production):

   ```bash
   export TRANSCRIBER_KEY=your-gemini-api-key-here
   ```

2. **.env File** (Recommended for development):
   Create a `.env` file in your project root:
   ```
   TRANSCRIBER_KEY=your-gemini-api-key-here
   ```

> Get your API key from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 4. Add an Audio File

Place your audio file (e.g., `audio.webm`) inside the `assets/` folder.

---

## 🧠 Usage

### Development

Run the TypeScript code directly using ts-node:

```bash
npx ts-node src/index.ts
```

### Production

Build and run the compiled JavaScript:

```bash
npm run build
node dist/index.js
```

The script will:

- Upload the audio to Gemini's File API
- Generate a transcription using `gemini-2.0-flash`
- Print the result to the console

---

## 🧩 Supported File Formats

- `.mp3`
- `.wav`
- `.aac`
- `.flac`
- `.ogg`
- `.webm` / `.weba`

If an unknown format is used, the script will attempt to upload it with a generic MIME type (`audio/octet-stream`).

---

## 🛠️ Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [@google/genai](https://www.npmjs.com/package/@google/genai)
- [dotenv](https://www.npmjs.com/package/dotenv) for environment variables
- ES Modules + Native Blob + File polyfill for Node

---

## 📌 Roadmap

- [ ] Save transcription results to `.txt` or `.json`
- [ ] Build a CLI interface using `commander`

## 📄 License

MIT License © 2024 Shriansh Agarwal
