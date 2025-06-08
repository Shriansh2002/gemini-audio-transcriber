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

	try {
		const isRemote = /^https?:\/\//i.test(audioFile);

		let filePath = audioFile;

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

			const { exists, status } = await checkUrlExists(audioFile, {
				timeout: 5000,
			});
			if (!exists) {
				console.error(
					chalk.red(
						`[error] Remote URL not reachable (status: ${
							status ?? "unknown"
						}): ${audioFile}`
					)
				);
				return {
					success: false,
					error: `Remote URL not reachable (status: ${status ?? "unknown"})`,
				};
			}
		}

		if (verbose) {
			console.time("TranscriptionTime");
		}

		const transcription = await transcribeAudio(filePath, {
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
			console.log(chalk.yellow("[warn] No transcription result returned."));
			return { success: false, error: "No transcription result returned." };
		}
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			console.error(chalk.red(`[error] File not found: ${audioFile}`));
			return { success: false, error: `File not found: ${audioFile}` };
		} else {
			console.error(
				chalk.red("[error] Unexpected error:"),
				err instanceof Error ? err.message : String(err)
			);
			return {
				success: false,
				error: `Unexpected error: ${
					err instanceof Error ? err.message : String(err)
				}`,
			};
		}
	}
}
