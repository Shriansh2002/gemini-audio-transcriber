import * as fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { transcribeAudio } from "./transcriber";
import { checkUrlExists } from "./utils/checkUrlExists";
import type { TranscriptionConfig, RunTranscriptionResult } from "./types";

/**
 * Transcribe audio from a local file path or a remote URL.
 *
 * @param {TranscriptionConfig} config - Configuration options for transcription.
 * @param {string} config.audioFile - Path to a local audio file or URL of a remote audio file.
 * @param {string} [config.style='conversational'] - Transcription style, e.g., 'conversational' or 'formal'.
 * @param {string} [config.language='english'] - Language code or name of the audio language.
 * @param {boolean} [config.verbose=true] - Enable verbose logging of processing steps and errors.
 * @param {number} [config.timeout=5000] - Timeout in milliseconds for checking remote URL availability.
 *
 * @returns {Promise<RunTranscriptionResult>} A promise that resolves to a structured transcription result
 *          including success status, transcription text (if successful), or error message.
 *
 * @throws Will not throw errors but return structured error results on failures such as:
 *         - Invalid or missing audio file path/URL
 *         - Local file not found or inaccessible
 *         - Remote URL unreachable or timing out
 *         - Unexpected errors during transcription process
 *
 * @example
 * const result = await runTranscription({ audioFile: "./audio.wav" });
 * if (result.success) {
 *   console.log("Transcription:", result.transcription);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export async function runTranscription(
	config: TranscriptionConfig
): Promise<RunTranscriptionResult> {
	const {
		audioFile,
		style = "conversational",
		language = "english",
		verbose = true,
		timeout = 5000,
	} = config;

	// Validate audioFile early
	if (typeof audioFile !== "string" || audioFile.trim() === "") {
		return {
			success: false,
			error: "Invalid audioFile parameter: must be a non-empty string",
		};
	}

	try {
		const isRemote = /^https?:\/\//i.test(audioFile);

		let filePath: string = audioFile;

		if (!isRemote) {
			const resolvedPath = path.resolve(audioFile);
			await fs.access(resolvedPath);
			if (verbose) {
				console.log(
					chalk.blueBright(`[info] Processing audio: ${resolvedPath}`)
				);
			}
			filePath = resolvedPath;
		} else {
			if (verbose) {
				console.log(
					chalk.blueBright(`[info] Fetching remote audio: ${audioFile}`)
				);
			}

			const checkResult = await checkUrlExists(audioFile, {
				timeout,
			});

			if (!checkResult.exists) {
				const statusText =
					checkResult.status !== undefined ? checkResult.status : "unknown";
				const errorMsg = `[error] Remote URL not reachable (status: ${statusText}): ${audioFile}`;
				console.error(chalk.red(errorMsg));
				return { success: false, error: errorMsg };
			}
		}

		if (verbose) {
			console.time("TranscriptionTime");
		}

		const transcription: string | null = await transcribeAudio(filePath, {
			style,
			language,
			sourceType: isRemote ? "remote" : "local",
		});

		if (verbose) {
			console.timeEnd("TranscriptionTime");
		}

		if (transcription) {
			if (verbose) {
				console.log(chalk.greenBright("\n--- Transcription ---\n"));
				console.log(transcription);
				console.log(chalk.greenBright("\n--- Done ---\n"));
			}
			return { success: true, transcription };
		} else {
			const warningMsg = "[warn] No transcription result returned.";
			if (verbose) {
				console.log(chalk.yellow(warningMsg));
			}
			return { success: false, error: "No transcription result returned." };
		}
	} catch (err: unknown) {
		if (
			typeof err === "object" &&
			err !== null &&
			"code" in err &&
			(err as NodeJS.ErrnoException).code === "ENOENT"
		) {
			const errorMsg = `[error] File not found: ${audioFile}`;
			console.error(chalk.red(errorMsg));
			return { success: false, error: errorMsg };
		} else {
			const errorMessage =
				err instanceof Error ? err.message : String(err ?? "Unknown error");
			console.error(chalk.red("[error] Unexpected error:"), errorMessage);
			return { success: false, error: `Unexpected error: ${errorMessage}` };
		}
	}
}

/**
 * Transcribe audio from a Blob object.
 *
 * @param {Blob} audioBlob - The audio Blob to transcribe.
 * @param {Omit<TranscriptionConfig, "audioFile">} options - Transcription options excluding audioFile.
 * @param {string} [options.style='conversational'] - Transcription style.
 * @param {string} [options.language='english'] - Language of the audio.
 * @param {boolean} [options.verbose=true] - Enable verbose logging.
 *
 * @returns {Promise<RunTranscriptionResult>} The transcription result with success status and error or transcription.
 */
export async function runTranscriptionWithBlob(
	audioBlob: Blob,
	options?: Omit<TranscriptionConfig, "audioFile">
): Promise<RunTranscriptionResult> {
	const {
		style = "conversational",
		language = "english",
		verbose = true,
	} = options ?? {};

	if (!audioBlob || typeof audioBlob.arrayBuffer !== "function") {
		const errorMsg =
			"Invalid audioBlob parameter: must be a valid Blob object.";
		if (verbose) console.error(chalk.red(`[error] ${errorMsg}`));
		return { success: false, error: errorMsg };
	}

	try {
		if (verbose) {
			console.log(
				chalk.blueBright("[info] Processing audio Blob for transcription")
			);
			console.time("TranscriptionTime");
		}

		const arrayBuffer = await audioBlob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const transcription = await transcribeAudio(buffer, {
			style,
			language,
			sourceType: "buffer",
		});

		if (verbose) {
			console.timeEnd("TranscriptionTime");
		}

		if (transcription) {
			if (verbose) {
				console.log(chalk.greenBright("\n--- Transcription ---\n"));
				console.log(transcription);
				console.log(chalk.greenBright("\n--- Done ---\n"));
			}
			return { success: true, transcription };
		} else {
			const warnMsg = "[warn] No transcription result returned.";
			if (verbose) console.log(chalk.yellow(warnMsg));
			return { success: false, error: "No transcription result returned." };
		}
	} catch (err: unknown) {
		const errMsg =
			err instanceof Error ? err.message : String(err ?? "Unknown error");
		if (verbose)
			console.error(chalk.red(`[error] Unexpected error: ${errMsg}`));
		return { success: false, error: `Unexpected error: ${errMsg}` };
	}
}
