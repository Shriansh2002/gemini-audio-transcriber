import * as fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import chalk from "chalk";
import { transcribeAudio } from "./transcriber";

dotenv.config();

// Use a local file or a Supabase URL
const AUDIO_FILE = "./assets/audio.webm";
// const AUDIO_FILE = "https://your-project.supabase.co/storage/v1/object/public/audio/sample.webm";

(async () => {
	try {
		// Only check existence for local files
		const isRemote = AUDIO_FILE.startsWith("http");
		if (!isRemote) {
			const resolvedPath = path.resolve(AUDIO_FILE);
			await fs.access(resolvedPath);
			console.log(chalk.blueBright(`[info] Processing audio: ${resolvedPath}`));
		} else {
			console.log(
				chalk.blueBright(`[info] Fetching remote audio: ${AUDIO_FILE}`)
			);
		}

		const transcription = await transcribeAudio(AUDIO_FILE, {
			style: "conversational",
			language: "english",
			sourceType: isRemote ? "supabase" : "local",
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
