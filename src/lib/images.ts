import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

const MIN_IMAGE_DIMENSIONS = 128;
const MAX_IMAGE_DIMENSIONS = 1024;
const MAX_IMAGE_SIZE = 1024 * 1024; // 1 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function validateImage(file: File): Promise<{ valid: boolean; error?: string; status?: number }> {
	if (!file || file.size == 0) return { valid: false, error: "Empty image file" };
	if (file.size > MAX_IMAGE_SIZE) return { valid: false, error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` };

	try {
		const buffer = Buffer.from(await file.arrayBuffer());

		// Check mime type
		const fileType = await fileTypeFromBuffer(buffer);
		if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime))
			return { valid: false, error: "Invalid image file type. Only .jpeg, .png, .gif, and .webp are allowed" };

		let metadata: sharp.Metadata;
		try {
			metadata = await sharp(buffer).metadata();
		} catch {
			return { valid: false, error: "Invalid or corrupted image file" };
		}

		// Check image dimensions
		if (
			!metadata.width ||
			!metadata.height ||
			metadata.width < MIN_IMAGE_DIMENSIONS ||
			metadata.width > MAX_IMAGE_DIMENSIONS ||
			metadata.height < MIN_IMAGE_DIMENSIONS ||
			metadata.height > MAX_IMAGE_DIMENSIONS
		) {
			return { valid: false, error: "Image dimensions are invalid. Width and height must be between 128px and 1024px" };
		}

		// Check for inappropriate content
		// https://github.com/trafficlunar/api-moderation
		try {
			const blob = new Blob([buffer]);
			const formData = new FormData();
			formData.append("image", blob);

			const moderationResponse = await fetch("https://api.trafficlunar.net/moderate/image", { method: "POST", body: formData });
			const result = await moderationResponse.json();

			if (!moderationResponse.ok) {
				console.error("Moderation API error:", result);
				return { valid: false, error: "Content moderation check failed", status: 500 };
			}

			if (result.error) {
				return { valid: false, error: result.error };
			}
		} catch (moderationError) {
			console.error("Error fetching moderation API:", moderationError);
			return { valid: false, error: "Moderation API is down", status: 503 };
		}

		return { valid: true };
	} catch (error) {
		console.error("Error validating image:", error);
		return { valid: false, error: "Failed to process image file.", status: 500 };
	}
}
