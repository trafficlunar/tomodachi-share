import { AES_CCM } from "@trafficlunar/asmcrypto.js";
import { MII_DECRYPTION_KEY } from "./constants";
import Mii from "./mii.js/mii";
import TomodachiLifeMii from "./tomodachi-life-mii";

export function convertQrCode(bytes: Uint8Array): { mii: Mii; tomodachiLifeMii: TomodachiLifeMii } {
	// Decrypt the Mii part of the QR code
	// (Credits to kazuki-4ys)
	const nonce = bytes.subarray(0, 8);
	const content = bytes.subarray(8, 0x70);

	const nonceWithZeros = new Uint8Array(12);
	nonceWithZeros.set(nonce, 0);

	let decrypted: Uint8Array<ArrayBufferLike> = new Uint8Array();
	try {
		decrypted = AES_CCM.decrypt(content, MII_DECRYPTION_KEY, nonceWithZeros, undefined, 16);
	} catch (error) {
		throw new Error("Failed to decrypt QR code. It may be invalid or corrupted");
	}

	const result = new Uint8Array(96);
	result.set(decrypted.subarray(0, 12), 0);
	result.set(nonce, 12);
	result.set(decrypted.subarray(12), 20);

	// Check if QR code is valid (after decryption)
	if (result.length !== 0x60 || (result[0x16] !== 0 && result[0x17] !== 0)) throw new Error("QR code is not a valid Mii QR code");

	// Convert to Mii classes
	try {
		const buffer = Buffer.from(result);
		const mii = new Mii(buffer);
		const tomodachiLifeMii = TomodachiLifeMii.fromBytes(bytes);

		if (tomodachiLifeMii.hairDyeEnabled) {
			mii.hairColor = tomodachiLifeMii.studioHairColor;
			mii.eyebrowColor = tomodachiLifeMii.studioHairColor;
			mii.facialHairColor = tomodachiLifeMii.studioHairColor;
		}

		return { mii, tomodachiLifeMii };
	} catch (error) {
		throw new Error("Mii data is not valid");
	}
}
