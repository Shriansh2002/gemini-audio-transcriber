import { TranscriptionStyle } from "../utils/prompt";

export type TranscriptionSources = "local" | "supabase";

export interface TranscribeAudioOptions {
	style?: TranscriptionStyle;
	language?: string | null;
	context?: string | null;
	sourceType?: TranscriptionSources;
}

export interface TranscriptionConfig {
	audioFile: string;
	style?: TranscriptionStyle;
	language?: string | null;
	verbose?: boolean;
}

export type KnownAudioExtension =
	| ".mp3"
	| ".wav"
	| ".aac"
	| ".flac"
	| ".ogg"
	| ".webm"
	| ".weba";

export type RunTranscriptionResult = {
	success: boolean;
	transcription?: string;
	error?: string;
};
