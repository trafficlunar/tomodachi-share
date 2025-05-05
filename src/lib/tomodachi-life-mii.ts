import { TOMODACHI_LIFE_DECRYPTION_KEY } from "../lib/constants";
import sjcl from "sjcl-with-all";

// @ts-expect-error - This is not in the types, but it's a function needed to enable CTR mode.
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]();

// Converts hair dye to studio color
// Reference: https://github.com/ariankordi/nwf-mii-cemu-toy/blob/9906440c1dafbe3f40ac8b95e10a22ebd85b441e/assets/data-conversion.js#L282
// (Credits to kat21)
const hairDyeConverter = [
	55, 51, 50, 12, 16, 12, 67, 61, 51, 64, 69, 66, 65, 86, 85, 93, 92, 19, 20, 20, 15, 32, 35, 26, 38, 41, 43, 18, 95, 97, 97, 99,
];

// All possible values for 2-bit hair dye mode.
export enum HairDyeMode {
	None = 0,
	Hair = 1,
	HairEyebrowBeard = 2,
	Invalid = 3,
}

// Reference: https://github.com/ariankordi/nwf-mii-cemu-toy/blob/ffl-renderer-proto-integrate/assets/kaitai-structs/tomodachi_life_qr_code.ksy
// (Credits to ariankordi for the byte locations)
export class TomodachiLifeMii {
	firstName: string;
	lastName: string;
	islandName: string;

	hairDye: number;
	hairDyeMode: HairDyeMode;

	// There are more properties but I don't plan to add them *yet*

	// Property below is not located in the bytes
	studioHairColor: number;

	constructor(buffer: ArrayBuffer) {
		const view = new DataView(buffer);
		let offset = 0;

		this.firstName = this.readUtf16String(buffer, offset, 32);
		offset += 32;
		this.lastName = this.readUtf16String(buffer, offset, 32);
		offset += 32;

		// Skip 3 unknown bytes
		offset += 3;

		// Read little-endian bit fields
		const bitField = view.getUint8(offset++);
		this.hairDyeMode = (bitField >> 6) & 0b00000011; // Bits 7-6
		this.hairDye = (bitField >> 1) & 0b00011111; // Bits 5-1

		// Skip 12 unknown bytes
		offset += 12;

		// Skip catchphrase
		offset += 32;

		// Skip 58 unknown bytes
		offset += 58;

		// Skip voice properties
		offset += 6;

		// Skip character properties
		offset += 5;

		// Skip 35 unknown bytes
		offset += 35;

		this.islandName = this.readUtf16String(buffer, offset, 20);

		// Convert hair dye color to studio color
		this.studioHairColor = hairDyeConverter[this.hairDye];
	}

	static fromBytes(bytes: Uint8Array): TomodachiLifeMii {
		const iv = bytes.subarray(0x70, 128);
		const encryptedExtraData = bytes.subarray(128, -4);

		const cipher = new sjcl.cipher.aes(TOMODACHI_LIFE_DECRYPTION_KEY);

		// Convert nonce and encrypted content to sjcl.BitArray.
		const encryptedBits = sjcl.codec.bytes.toBits(Array.from(encryptedExtraData));
		const ivBits = sjcl.codec.bytes.toBits(Array.from(iv));
		// Perform decryption.
		const decryptedBits = sjcl.mode.ctr.decrypt(cipher, encryptedBits, ivBits);
		// Convert from sjcl format.
		const decryptedExtraData = sjcl.codec.bytes.fromBits(decryptedBits);
		const data = new Uint8Array(decryptedExtraData);

		return new TomodachiLifeMii(data.buffer);
	}

	private readUtf16String(buffer: ArrayBuffer, offset: number, byteLength: number): string {
		const bytes = new Uint8Array(buffer, offset, byteLength);
		let str = "";

		// We process every 2 bytes (UTF-16)
		for (let i = 0; i < bytes.length; i += 2) {
			const charCode = bytes[i] | (bytes[i + 1] << 8);
			if (charCode === 0) break; // Stop at the null terminator (0x0000)
			str += String.fromCharCode(charCode);
		}

		return str;
	}
}
