import { profanity } from "@2toad/profanity";
// import { AES_CCM } from "@trafficlunar/asmcrypto.js";
import sjcl from "sjcl-with-all";

import { MII_DECRYPTION_KEY, MII_QR_ENCRYPTED_LENGTH } from "./constants";
import Mii from "./mii.js/mii";
import { TomodachiLifeMii, HairDyeMode } from "./tomodachi-life-mii";

// AES-CCM encrypted Mii QR codes have some errata (https://www.3dbrew.org/wiki/AES_Registers#CCM_mode_pitfall)
// causing them to not be easily decryptable by asmcrypto
// or sjcl, they can't verify the nonce/tag.

// In order to use sjcl's decrypt function without
// verification, a private function needs to be called.
// This private function's name is originally "_ctrMode"
// but its name is minified across builds.
// In "sjcl-with-all" v1.0.8 from npm, the name is "u"

/** Private _ctrMode function defined here: {@link https://github.com/bitwiseshiftleft/sjcl/blob/85caa53c281eeeb502310013312c775d35fe0867/core/ccm.js#L194} */
const sjclCcmCtrMode: ((
	prf: sjcl.SjclCipher, data: sjcl.BitArray, iv: sjcl.BitArray,
	tag: sjcl.BitArray, tlen: number, L: number
) => { data: sjcl.BitArray; tag: sjcl.BitArray }) | undefined =
	// @ts-expect-error -- Referencing a private function that is not in the types.
	sjcl.mode.ccm.u; // NOTE: This may need to be changed with a different sjcl build. Read above

export function convertQrCode(bytes: Uint8Array): { mii: Mii; tomodachiLifeMii: TomodachiLifeMii } {
	// Decrypt 96 byte 3DS/Wii U format Mii data from the QR code.
	// References (Credits: jaames, kazuki-4ys):
	// - https://gist.github.com/jaames/96ce8daa11b61b758b6b0227b55f9f78
	// - https://github.com/kazuki-4ys/kazuki-4ys.github.io/blob/148dc339974f8b7515bfdc1395ec1fc9becb68ab/web_apps/MiiInfoEditorCTR/encode.js#L57

	// Check that the private _ctrMode function is defined.
	if (!sjclCcmCtrMode) {
		throw new Error("Private sjcl.mode.ccm._ctrMode function cannot be found. The build of sjcl expected may have changed. Read src/lib/qr-codes.ts for more details.");
	}

	// Verify that the length is not smaller than expected.
	if (bytes.length < MII_QR_ENCRYPTED_LENGTH) {
		throw new Error(`Mii QR code has wrong size (got ${bytes.length}, expected ${MII_QR_ENCRYPTED_LENGTH} or longer)`);
	}

	const nonce = bytes.subarray(0, 8); // Extract the AES-CCM nonce.
	const encryptedContent = bytes.subarray(8); // Extract the ciphertext.

	const cipher = new sjcl.cipher.aes(MII_DECRYPTION_KEY); // Construct new sjcl cipher.

	// Convert encrypted content and nonce to sjcl.BitArray (toBits expects array)
	const encryptedBits = sjcl.codec.bytes.toBits(Array.from(encryptedContent));
	const nonceBits = sjcl.codec.bytes.toBits([...nonce, 0, 0, 0, 0]); // Pad to 12 bytes.

	// Isolate the actual ciphertext from the tag and adjust IV.
	// Copied from sjcl.mode.ccm.decrypt: https://github.com/bitwiseshiftleft/sjcl/blob/85caa53c281eeeb502310013312c775d35fe0867/core/ccm.js#L83
	const tlen = 128; // Tag length in bits.
	const dataWithoutTag = sjcl.bitArray.clamp(encryptedBits,
		// remove tag from out, tag length = 128
		sjcl.bitArray.bitLength(encryptedBits) - tlen);

	let decryptedBits: { data: sjcl.BitArray };
	try {
		decryptedBits = sjclCcmCtrMode(cipher, dataWithoutTag, nonceBits, [], tlen, 3); // hardcoding 3 as "L" / length
	} catch {
		// Note that the function above is not likely to fail since it decrypts without verification.
		throw new Error("Failed to decrypt QR code. It may be invalid or corrupted");
	}
	// NOTE: The CBC-MAC within the QR code is NOT verified here.

	// Convert the decrypted bytes from sjcl format.
	const decryptedBytes = sjcl.codec.bytes.fromBits(decryptedBits.data);
	const decryptedSlice = new Uint8Array(decryptedBytes).subarray(0, 88);

	// Create the final Mii StoreData from the decrypted bytes.
	const result = new Uint8Array([
		...decryptedSlice.subarray(0, 12), // First 12 decrypted bytes.
		...nonce, // Original nonce from the encrypted bytes.
		...decryptedSlice.subarray(12), // Then the rest of the decrypted bytes.
	]);

	// Check if Mii data is valid by checking always zero "reserved_2" field.
	if (result[0x16] !== 0 && result[0x17] !== 0) {
		throw new Error("QR code is not a valid Mii QR code");
	}

	// Construct mii-js Mii and TomodachiLifeMii classes.
	try {
		const buffer = Buffer.from(result); // Convert to node Buffer.
		const mii = new Mii(buffer); // Will verify the Mii data further.
		// Decrypt Tomodachi Life Mii data from encrypted QR code bytes.
		const tomodachiLifeMii = TomodachiLifeMii.fromBytes(bytes);

		// Apply hair dye fields.
		switch (tomodachiLifeMii.hairDyeMode) {
			case HairDyeMode.HairEyebrowBeard:
				mii.eyebrowColor = tomodachiLifeMii.studioHairColor;
				mii.facialHairColor = tomodachiLifeMii.studioHairColor;
				// Fall-through and also apply to hair.
			case HairDyeMode.Hair:
				mii.hairColor = tomodachiLifeMii.studioHairColor;
				break;
			// Default: do not apply hair dye.
		}

		// Censor potential inappropriate words.
		tomodachiLifeMii.firstName = profanity.censor(tomodachiLifeMii.firstName);
		tomodachiLifeMii.lastName = profanity.censor(tomodachiLifeMii.lastName);
		tomodachiLifeMii.islandName = profanity.censor(tomodachiLifeMii.islandName);

		return { mii, tomodachiLifeMii };
	} catch (error) {
		console.error(error);
		throw new Error("Mii data is not valid");
	}
}
