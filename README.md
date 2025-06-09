# 🎙️ audio-transcripter

[![npm version](https://img.shields.io/npm/v/audio-transcripter.svg)](https://www.npmjs.com/package/audio-transcripter) [![license](https://img.shields.io/npm/l/audio-transcripter.svg)](https://github.com/Shriansh2002/gemini-audio-transcriber/blob/main/LICENSE) [![downloads](https://img.shields.io/npm/dm/audio-transcripter.svg)](https://www.npmjs.com/package/audio-transcripter)

A lightweight TypeScript library for transcribing audio files using **Google Gemini 2.0** models.

Supports local files, remote URLs, and in-memory buffers/blobs.

**Ideal for meetings, interviews, podcasts, technical content, and more.**

---

## 🚀 Installation

```bash
npm install audio-transcripter
```

---

## 🌟 Features

- 🎧 Supports local files (`.wav`, `.mp3`, `.aac`, `.flac`, `.ogg`, `.webm`, etc.)
- 🌐 Supports remote URLs (HTTP/HTTPS)
- 📦 Supports Blobs / Buffers
- ✨ Multiple transcription styles:

  - `accurate`
  - `clean`
  - `structured`
  - `technical`
  - `conversational`

- 🔍 Verbose logging (optional)
- ⚙️ Written in TypeScript with full type safety

---

## 🧑‍💻 Usage

### 1️⃣ Transcribe Local File

```ts
import { runTranscription } from "audio-transcripter";

const result = await runTranscription({
	audioFile: "./assets/audio.webm",
	style: "structured", // optional, default: 'conversational'
	language: "english", // optional
});

if (result.success) {
	console.log("Transcription:", result.transcription);
} else {
	console.error("Error:", result.error);
}
```

---

### 2️⃣ Transcribe Remote URL

```ts
const result = await runTranscription({
	audioFile: "https://example.com/audio.mp3",
	style: "clean",
	language: "english",
});
```

---

### 3️⃣ Transcribe Blob / Buffer (for browser or Node.js)

```ts
import { runTranscriptionWithBlob } from "audio-transcripter";

// Example with a Node.js Buffer
const fs = await import("fs/promises");
const audioBuffer = await fs.readFile("./assets/audio.wav");

const result = await runTranscriptionWithBlob(audioBuffer, {
	style: "technical",
	language: "english",
});

if (result.success) {
	console.log("Transcription:", result.transcription);
} else {
	console.error("Error:", result.error);
}
```

---

## 📥 Configuration Options

| Option      | Type    | Default            | Description                                       |
| ----------- | ------- | ------------------ | ------------------------------------------------- |
| `audioFile` | string  | _required_         | Local file path or remote URL                     |
| `style`     | string  | `'conversational'` | Transcription style (see below)                   |
| `language`  | string  | `'english'`        | Language of the audio                             |
| `verbose`   | boolean | `true`             | Enable verbose console logs                       |
| `timeout`   | number  | `5000` (ms)        | Timeout for remote URL HEAD check (if applicable) |

---

## 🎨 Supported Transcription Styles

| Style            | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `accurate`       | High accuracy, raw transcription including filler words      |
| `clean`          | Edited for readability (filler words removed, grammar fixed) |
| `structured`     | Meeting/interview format with speakers and structure         |
| `technical`      | Technical content with jargon preserved                      |
| `conversational` | Casual, creative, natural conversation transcription         |

---

## 🗂️ Supported File Formats

- `.mp3`
- `.wav`
- `.aac`
- `.flac`
- `.ogg`
- `.webm` / `.weba`

> Unknown formats fallback to `audio/octet-stream`.

---

## 📚 API Reference

### `runTranscription(config: TranscriptionConfig)`

Runs transcription on local file path or remote URL.

Returns: `Promise<RunTranscriptionResult>`

```ts
type RunTranscriptionResult = {
	success: boolean;
	transcription?: string;
	error?: string;
};
```

---

### `runTranscriptionWithBlob(audioBlob: Blob | Buffer, options?)`

Runs transcription on an in-memory Blob or Node.js Buffer.

Returns: `Promise<RunTranscriptionResult>`

---

## 🗂️ Type Definitions

```ts
export type TranscriptionStyle =
	| "accurate"
	| "clean"
	| "structured"
	| "technical"
	| "conversational";

export interface TranscriptionConfig {
	audioFile: string;
	style?: TranscriptionStyle;
	language?: string | null;
	verbose?: boolean;
	timeout?: number;
}

export interface RunTranscriptionResult {
	success: boolean;
	transcription?: string;
	error?: string;
}
```

---

## 🔐 Authentication

This package requires a **Gemini API Key**.

1️⃣ Set `TRANSCRIBER_KEY` in your environment:

```bash
export TRANSCRIBER_KEY=your-gemini-api-key-here
```

or

2️⃣ Create a `.env` file:

```dotenv
TRANSCRIBER_KEY=your-gemini-api-key-here
```

Get your API key from [Google MakerSuite](https://makersuite.google.com/app/apikey).

---

## 🛠️ Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [@google/genai](https://www.npmjs.com/package/@google/genai)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📄 License

MIT License © 2025 Shriansh Agarwal

---

## 🙋 FAQ

**Q:** Does this upload my file to third-party storage?

**A:** No. Files are uploaded only to Gemini's File API endpoint.

**Q:** Can I use this in the browser?

**A:** `runTranscriptionWithBlob` works with browser Blob and Node.js Buffer.

**Q:** What models are used?

**A:** `gemini-2.0-flash` model via Google GenAI SDK.

---

# Summary

✅ Lightweight  
✅ Flexible API  
✅ Multiple transcription styles  
✅ Works with Files, URLs, Blobs/Buffer  
✅ Production-ready TypeScript types

---
