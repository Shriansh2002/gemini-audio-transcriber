import { TranscribeAudioOptions } from "./types";
import {
	createFileFromBuffer,
	getFileBuffer,
	getMimeType
} from "./utils/file-helper";
import {
	buildTranscriptionPrompt,
	generateTranscription,
	uploadFileToGenAI,
} from "./utils/genAi";

export async function transcribeAudio(
	input: string | Buffer,
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

		// Step 1: Get file buffer
		const buffer = await getFileBuffer(input, sourceType);
		if (!buffer) {
			return null;
		}

		// Step 2: Create file object
		const file = createFileFromBuffer(buffer, input, sourceType);

		// Step 3: Upload file
		const mimeType =
			sourceType === "buffer" ? "audio/wav" : getMimeType(input as string);
		const uploadResult = await uploadFileToGenAI(file, mimeType);
		if (!uploadResult) {
			return null;
		}

		// Step 4: Build prompt
		const prompt = buildTranscriptionPrompt(style, language, context);

		// Step 5: Generate transcription
		return await generateTranscription(
			prompt,
			uploadResult.uri,
			uploadResult.mimeType
		);
	} catch (err: unknown) {
		console.error(
			"[error] Failed to transcribe:",
			err instanceof Error ? err.message : String(err)
		);
		return null;
	}
}
