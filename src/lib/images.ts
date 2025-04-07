// import * as tf from "@tensorflow/tfjs-node";
// import * as nsfwjs from "nsfwjs";
import sharp from "sharp";

const MIN_IMAGE_DIMENSIONS = 128;
const MAX_IMAGE_DIMENSIONS = 1024;
const MAX_IMAGE_SIZE = 1024 * 1024; // 1 MB

const THRESHOLD = 0.5;

// tf.enableProdMode();

// Load NSFW.JS model
// let _model: nsfwjs.NSFWJS | undefined = undefined;

// async function loadModel() {
// 	if (!_model) {
// 		const model = await nsfwjs.load("MobileNetV2Mid");
// 		_model = model;
// 	}
// 	return _model!;
// }

export async function validateImage(file: File): Promise<{ valid: boolean; error?: string; status?: number }> {
	if (!file || file.size == 0) return { valid: false, error: "Empty image file" };
	if (!file.type.startsWith("image/")) return { valid: false, error: "Invalid file type. Only images are allowed" };
	if (file.size > MAX_IMAGE_SIZE)
		return { valid: false, error: `One or more of your images are too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` };

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		const metadata = await sharp(buffer).metadata();

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
		// const image = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;
		// const model = await loadModel();
		// const predictions = await model.classify(image);
		// image.dispose();

		// for (const pred of predictions) {
		// 	if (
		// 		(pred.className === "Porn" && pred.probability > THRESHOLD) ||
		// 		(pred.className === "Hentai" && pred.probability > THRESHOLD) ||
		// 		(pred.className === "Sexy" && pred.probability > THRESHOLD)
		// 	) {
		// 		// reject image
		// 		return { valid: false, error: "Image contains inappropriate content" };
		// 	}
		// }
	} catch (error) {
		console.error("Error validating image:", error);
		return { valid: false, error: "Failed to process image file.", status: 500 };
	}

	return { valid: true };
}
