import * as fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { transcribeAudio } from "./transcriber";
import type { TranscriptionConfig } from "./types";

export async function runTranscription(config: TranscriptionConfig) {
	const { audioFile, style = "conversational", language = "english" } = config;

	try {
		const isRemote = audioFile.startsWith("http");
		let filePath = audioFile;

		if (!isRemote) {
			const resolvedPath = path.resolve(audioFile);
			await fs.access(resolvedPath);
			console.log(chalk.blueBright(`[info] Processing audio: ${resolvedPath}`));
			filePath = resolvedPath;
		} else {
			console.log(
				chalk.blueBright(`[info] Fetching remote audio: ${audioFile}`)
			);
		}

		const transcription = await transcribeAudio(filePath, {
			style,
			language,
			sourceType: isRemote ? "supabase" : "local",
		});

		if (transcription) {
			console.log(chalk.greenBright("\n--- Transcription ---\n"));
			console.log(transcription);
			console.log(chalk.greenBright("\n--- Done ---\n"));
			return transcription;
		} else {
			console.log(chalk.yellow("[warn] No transcription result returned."));
			return null;
		}
	} catch (err: unknown) {
		if (err instanceof Error && (err as any).code === "ENOENT") {
			console.error(chalk.red(`[error] File not found: ${audioFile}`));
		} else {
			console.error(
				chalk.red("[error] Unexpected error:"),
				err instanceof Error ? err.message : String(err)
			);
		}
		return null;
	}
}
