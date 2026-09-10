import { expect, test } from "bun:test";
import sharp from "sharp";
import { renderSocialImage } from "./social-image";

test("renders wrapped metadata and literal markup characters as a social PNG", async () => {
	const image = await renderSocialImage({
		title: "A longer title about fonts, layouts & <components> on the web",
		description:
			'Testing "quoted text", apostrophes, <tags> & Unicode: café — typography that remains readable across multiple lines.',
		date: "2026-09-09"
	});
	const metadata = await sharp(image).metadata();
	expect(metadata.format).toBe("png");
	expect([metadata.width, metadata.height]).toEqual([1200, 630]);
});

test("rejects metadata that cannot fit instead of publishing clipped text", async () => {
	await expect(
		renderSocialImage({
			title: "An excessively long title ".repeat(100),
			description: "Description",
			date: "2026-09-09"
		})
	).rejects.toThrow("Social image text does not fit");
});
