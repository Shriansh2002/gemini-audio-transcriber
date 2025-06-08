import https from "node:https";
import http from "node:http";

export function checkUrlExists(
	url: string,
	options?: { timeout?: number; verbose?: boolean }
): Promise<{ exists: boolean; status?: number }> {
	return new Promise((resolve) => {
		const client = url.startsWith("https") ? https : http;
		const timeoutMs = options?.timeout ?? 5000;

		const req = client.request(url, { method: "HEAD" }, (res) => {
			const exists =
				res.statusCode !== undefined &&
				res.statusCode >= 200 &&
				res.statusCode < 400;
			resolve({ exists, status: res.statusCode });
		});

		req.on("error", (err) => {
			if (options?.verbose) {
				console.error("Error in checkUrlExists:", err.message);
			}
			resolve({ exists: false });
		});

		req.setTimeout(timeoutMs, () => {
			req.destroy();
			resolve({ exists: false });
		});

		req.end();
	});
}
