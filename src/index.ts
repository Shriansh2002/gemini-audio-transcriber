import * as fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import chalk from "chalk";
import { transcribeAudio } from "./transcriber";

dotenv.config();

const AUDIO_FILE = "./assets/audio.webm";

(async () => {
	try {
		const resolvedPath = path.resolve(AUDIO_FILE);
		await fs.access(resolvedPath);
		console.log(chalk.blueBright(`[info] Processing audio: ${resolvedPath}`));

		const transcription = await transcribeAudio(resolvedPath, {
			style: "conversational",
			language: "english",
		});
		if (transcription) {
			console.log(chalk.greenBright("\n--- Transcription ---\n"));
			console.log(transcription);
			console.log(chalk.greenBright("\n--- Done ---\n"));
		} else {
			console.log(chalk.yellow("[warn] No transcription result returned."));
		}
	} catch (err: unknown) {
		if (err instanceof Error && "code" in err && err.code === "ENOENT") {
			console.error(chalk.red(`[error] File not found: ${AUDIO_FILE}`));
		} else {
			console.error(
				chalk.red("[error] Unexpected error:"),
				err instanceof Error ? err.message : String(err)
			);
		}
	}
})();
