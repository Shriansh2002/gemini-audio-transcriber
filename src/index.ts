import * as fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { transcribeAudio } from "./transcriber";
import { checkUrlExists } from "./utils/checkUrlExists";
import type { TranscriptionConfig, RunTranscriptionResult } from "./types";

export async function runTranscription(
	config: TranscriptionConfig
): Promise<RunTranscriptionResult> {
	const {
		audioFile,
		style = "conversational",
		language = "english",
		verbose = true,
	} = config;

	// Validate audioFile early
	if (typeof audioFile !== "string" || audioFile.trim() === "") {
		return {
			success: false,
			error: "Invalid audioFile parameter: must be a non-empty string",
		};
	}

	try {
		const isRemote: boolean = /^https?:\/\//i.test(audioFile);

		let filePath: string = audioFile;

		if (!isRemote) {
			const resolvedPath: string = path.resolve(audioFile);
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

			const checkResult: { exists: boolean; status?: number } =
				await checkUrlExists(audioFile, {
					timeout: 5000,
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
			sourceType: isRemote ? "supabase" : "local",
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
