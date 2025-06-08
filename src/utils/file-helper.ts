import * as fs from "node:fs/promises";
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

export async function getFileBuffer(
	input: string | Buffer,
	sourceType: "local" | "remote" | "buffer"
): Promise<Buffer | null> {
	try {
		if (sourceType === "buffer") {
			return input as Buffer;
		} else if (sourceType === "remote") {
			return await getRemoteFileBuffer(input as string);
		} else {
			return await getLocalFileBuffer(input as string);
		}
	} catch (error) {
		console.error(
			`[error] Failed to get file buffer:`,
			error instanceof Error ? error.message : String(error)
		);
		return null;
	}
}

async function getRemoteFileBuffer(filePath: string): Promise<Buffer> {
	const response = await fetch(filePath);
	if (!response.ok) {
		throw new Error(`Failed to fetch remote file: ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

async function getLocalFileBuffer(filePath: string): Promise<Buffer> {
	return await fs.readFile(filePath);
}

export function createFileFromBuffer(
	buffer: Buffer,
	input: string | Buffer,
	sourceType: "local" | "remote" | "buffer"
): CustomFile {
	let mimeType: string;
	let fileName: string;

	if (sourceType === "buffer") {
		mimeType = "audio/wav";
		fileName = "audio_buffer.wav";
	} else {
		const filePath = input as string;
		mimeType = getMimeType(filePath);
		fileName = path.basename(filePath);
	}

	return new CustomFile([buffer], fileName, { type: mimeType });
}
