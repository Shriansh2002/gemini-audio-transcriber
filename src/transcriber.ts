import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { CustomFile, getMimeType } from "./utils/file-helper";
import dotenv from "dotenv";
import { TRANSCRIPTION_PROMPTS } from "./utils/prompt";
import { TranscribeAudioOptions } from "./types";

// Try to load .env file from current working directory
dotenv.config();

// Get API key from environment variables or .env file
const API_KEY = process.env.TRANSCRIBER_KEY;

if (!API_KEY) {
	throw new Error(
		"TRANSCRIBER_KEY is missing. Please set it in one of the following ways:\n" +
			"1. Set it as an environment variable: export TRANSCRIBER_KEY=your-key-here\n" +
			"2. Create a .env file in your project root with: TRANSCRIBER_KEY=your-key-here\n\n" +
			"Get your API key from: https://makersuite.google.com/app/apikey"
	);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function transcribeAudio(
	filePath: string,
	options: TranscribeAudioOptions = {}
): Promise<string | null> {
	try {
		// Destructure with default values and types
		const {
			style = "accurate",
			language = null,
			context = null,
			sourceType = "local",
		} = options;

		let buffer: Buffer;

		if (sourceType === "supabase") {
			const response = await fetch(filePath);
			if (!response.ok) {
				console.error(
					`[error] Failed to fetch remote file: ${response.statusText}`
				);
				return null;
			}
			const arrayBuffer = await response.arrayBuffer();
			buffer = Buffer.from(arrayBuffer);
		} else {
			buffer = await fs.readFile(filePath);
		}

		const mimeType: string = getMimeType(filePath);
		const fileName: string = path.basename(filePath);

		const file = new CustomFile([buffer], fileName, { type: mimeType });

		const uploadResponse = await genAI.files.upload({
			file,
			config: { mimeType },
		});

		if (!uploadResponse || !uploadResponse.uri || !uploadResponse.mimeType) {
			console.error("[error] Failed to upload file or missing response data.");
			return null;
		}

		const fileUri: string = uploadResponse.uri;
		const uploadedMimeType: string = uploadResponse.mimeType;

		let prompt: string =
			TRANSCRIPTION_PROMPTS[style] || TRANSCRIPTION_PROMPTS.accurate;

		if (language) {
			prompt += `\n\nIMPORTANT: The audio is in ${language}. Please transcribe in the same language.`;
		}

		if (context) {
			prompt += `\n\nContext: ${context}`;
		}

		const response = await genAI.models.generateContent({
			model: "gemini-2.0-flash", // Use the correct model name
			contents: [
				{
					role: "user",
					parts: [
						{
							text: prompt,
						},
						{
							fileData: {
								fileUri: fileUri,
								mimeType: uploadedMimeType,
							},
						},
					],
				},
			],
		});
		return response?.candidates?.[0]?.content?.parts?.[0]?.text || null;
	} catch (err: unknown) {
		console.error(
			"[error] Failed to transcribe:",
			err instanceof Error ? err.message : String(err)
		);
		return null;
	}
}
