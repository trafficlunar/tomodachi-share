import { TOMODACHI_LIFE_DECRYPTION_KEY } from "@/lib/constants";
import { AES_CTR } from "@trafficlunar/asmcrypto.js";

// Converts hair dye to studio color
// (Credits to kat21)
const hairDyeConverter = [
	55, 51, 50, 12, 16, 12, 67, 61, 51, 64, 69, 66, 65, 86, 85, 93, 92, 19, 20, 20, 15, 32, 35, 26, 38, 41, 43, 18, 95, 97, 97, 99,
];

// (Credits to ariankordi for the byte locations)
export default class TomodachiLifeMii {
	firstName: string;
	lastName: string;
	islandName: string;

	hairDye: number;
	hairDyeEnabled: boolean;

	// There is more properties but I don't plan to add them *yet*

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

		// Read bit fields
		const bitField = view.getUint8(offset++);
		this.hairDyeEnabled = (bitField & 0x80) !== 0;
		this.hairDye = (bitField & 0x3e) >> 1;

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
		const iv = bytes.slice(0x70, 128);
		const encryptedExtraData = bytes.slice(128, -4);
		const decryptedExtraData = AES_CTR.decrypt(encryptedExtraData, TOMODACHI_LIFE_DECRYPTION_KEY, iv);
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
