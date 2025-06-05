import * as path from "node:path";
import { KnownAudioExtension } from "../types";

interface CustomFileOptions extends BlobPropertyBag {
	lastModified?: number;
}

export class CustomFile extends Blob {
	readonly name: string;
	readonly lastModified: number;

	constructor(
		fileBits: BlobPart[],
		fileName: string,
		options: CustomFileOptions = {}
	) {
		super(fileBits, options);
		this.name = fileName;
		this.lastModified = options.lastModified ?? Date.now();
	}
}
const mimeTypes: Record<KnownAudioExtension, string> = {
	".mp3": "audio/mpeg",
	".wav": "audio/wav",
	".aac": "audio/aac",
	".flac": "audio/flac",
	".ogg": "audio/ogg",
	".webm": "audio/webm",
	".weba": "audio/webm",
} as const;

export function getMimeType(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();

	if (Object.hasOwn(mimeTypes, ext)) {
		return mimeTypes[ext as KnownAudioExtension];
	} else {
		console.warn(
			`[warn] Unknown extension '${ext}' for path '${filePath}', using fallback 'audio/octet-stream'.`
		);
		return "audio/octet-stream";
	}
}
