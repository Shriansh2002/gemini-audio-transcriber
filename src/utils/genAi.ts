import dotenv from "dotenv";

import { GoogleGenAI } from "@google/genai";
import { CustomFile } from "./file-helper";
import { TRANSCRIPTION_PROMPTS, TranscriptionStyle } from "./prompt";

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

export async function uploadFileToGenAI(
	file: CustomFile,
	mimeType: string
): Promise<{ uri: string; mimeType: string } | null> {
	try {
		const uploadResponse = await genAI.files.upload({
			file,
			config: { mimeType },
		});

		if (!uploadResponse || !uploadResponse.uri || !uploadResponse.mimeType) {
			console.error("[error] Failed to upload file or missing response data.");
			return null;
		}

		return {
			uri: uploadResponse.uri,
			mimeType: uploadResponse.mimeType,
		};
	} catch (error) {
		console.error(
			"[error] Failed to upload file:",
			error instanceof Error ? error.message : String(error)
		);
		return null;
	}
}

// Prompt building function
export function buildTranscriptionPrompt(
	style: string,
	language: string | null,
	context: string | null
): string {
	let prompt: string =
		TRANSCRIPTION_PROMPTS[style as TranscriptionStyle] ||
		TRANSCRIPTION_PROMPTS.accurate;

	if (language) {
		prompt += `\n\nIMPORTANT: The audio is in ${language}. Please transcribe in the same language.`;
	}

	if (context) {
		prompt += `\n\nContext: ${context}`;
	}

	return prompt;
}

export async function generateTranscription(
	prompt: string,
	fileUri: string,
	mimeType: string
): Promise<string | null> {
	try {
		const response = await genAI.models.generateContent({
			model: "gemini-2.0-flash",
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
								mimeType: mimeType,
							},
						},
					],
				},
			],
		});

		return response?.candidates?.[0]?.content?.parts?.[0]?.text || null;
	} catch (error) {
		console.error(
			"[error] Failed to generate transcription:",
			error instanceof Error ? error.message : String(error)
		);
		return null;
	}
}
