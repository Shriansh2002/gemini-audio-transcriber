import https from "node:https";
import http from "node:http";

export function checkUrlExists(url: string): Promise<boolean> {
	return new Promise((resolve) => {
		const client = url.startsWith("https") ? https : http;

		const req = client.request(url, { method: "HEAD" }, (res) => {
			resolve(
				res.statusCode !== undefined &&
					res.statusCode >= 200 &&
					res.statusCode < 400
			);
		});

		req.on("error", () => resolve(false));
		req.end();
	});
}
