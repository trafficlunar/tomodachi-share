import type { BitArray } from "sjcl";

/** Length of an encrypted Mii QR code, without extra data. (CFLiWrappedMiiData) */
export const MII_QR_ENCRYPTED_LENGTH = 112;

// Keys are in sjcl.BitArray format.

/** AES-CCM key for Mii QR codes. Original: 59FC817E6446EA6190347B20E9BDCE52 */
export const MII_DECRYPTION_KEY: BitArray = [1509720446, 1682369121, -1875608800, -373436846];

/** AES-CTR key for Tomodachi Life extra data at the end of Mii QR codes. Original: 30819F300D06092A864886F70D010101 */
export const TOMODACHI_LIFE_DECRYPTION_KEY: BitArray = [813801264, 218499370, -2042067209, 218169601];

// Keys as Uint8Array.
// export const MII_DECRYPTION_KEY = new Uint8Array([0x59, 0xfc, 0x81, 0x7e, 0x64, 0x46, 0xea, 0x61, 0x90, 0x34, 0x7b, 0x20, 0xe9, 0xbd, 0xce, 0x52]);
// export const TOMODACHI_LIFE_DECRYPTION_KEY = new Uint8Array([0x30, 0x81, 0x9f, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]);
