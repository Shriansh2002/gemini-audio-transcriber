import * as path from "node:path";

interface CustomFileOptions extends BlobPropertyBag {
	lastModified?: number; // Optional last modified timestamp
}

export class CustomFile extends Blob {
	public readonly name: string;
	public readonly lastModified: number;

	/**
	 * Creates a new CustomFile instance.
	 * @param fileBits An array of BlobParts (ArrayBuffer, ArrayBufferView, Blob, string) that will be put into the file.
	 * @param fileName The name of the file.
	 * @param options Optional settings for the Blob and CustomFile.
	 */
	constructor(
		fileBits: BlobPart[],
		fileName: string,
		options?: CustomFileOptions
	) {
		super(fileBits, options);
		this.name = fileName;
		this.lastModified = options?.lastModified ?? Date.now();
	}
}

/**
 * Determines the MIME type of a file based on its extension.
 * @param filePath The path to the file.
 * @returns The determined MIME type as a string, or "audio/octet-stream" if unknown.
 */
export async function getMimeType(filePath: string): Promise<string> {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".mp3":
			return "audio/mpeg";
		case ".wav":
			return "audio/wav";
		case ".aac":
			return "audio/aac";
		case ".flac":
			return "audio/flac";
		case ".ogg":
			return "audio/ogg";
		case ".webm":
		case ".weba": // Assuming .weba is also audio/webm for consistency
			return "audio/webm";
		default:
			console.warn(
				`[warn] Unknown extension '${ext}' for path '${filePath}', using fallback 'audio/octet-stream'.`
			);
			return "audio/octet-stream";
	}
}
