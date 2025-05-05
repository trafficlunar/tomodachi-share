import { convertQrCode } from "./qr-codes";
import { describe, it, expect } from "vitest";
import Mii from "./mii.js/mii";
import { TomodachiLifeMii, HairDyeMode } from "./tomodachi-life-mii";

// List of encrypted QR code data to test against.
const validQrCodes = [
	// Frieren (from step6.webp)
	{
		base64: "lymEx6TA4eLgfwTEceW+DbdYBTfBfPKM4VesJkq1qzoGGXnk/3OohvPPuGS8mmnzvpvyC36ge8+C2c4IIhJ0l7Lx9KKxnPEAuLBM1YtCnSowjVNHo3CmjE7D7lkDUBuhO3qKjAqWXfQthtqBqjTe4Hv95TKNVPimaxNXhAVZGSmOMh++0Z2N0TvIDpU/8kxLIsgntsQH4PNlaFcVF2HeOERXRdTm/TMFb6pozO57nJ9NKi5bxh1ClNArbpyTQgBe7cfvnNretFVNWzGJBWctZC7weecYIKyU3qbH5c4kogmj4WcfJhYsuOT3odvv2WBaGhchgR779Ztc0E76COxNEaJa6M7QDyHGw8XQfxCH3j4pMkhFOlPn/ObS3rNUADYUCY8d+Wt4fBbO7PTW7ppDnDaCyxwEIbglsMtkD/cIPIr4f0RPnpV7ZlOmrJ3HdIbmwXi6TqKTwqkHtBmBPvZVpXm4RJN8A6gF22Uc7NY8B3KMYY7Q",
		expected: {
			miiName: "Frieren",
			firstName: "Frieren",
			lastName: "the Slayer",
			islandName: "Wuhu",
		},
	},
	{
		base64: "ky1cf9hr9xotl250Y8cDOGqPd7t51NS8tNVrJMRAI2bfXr4LNirKvqu7ZrvC00vgz70NU8kQRR6H3uAnRaHupxjLbeYfU0s6CduruAEnXP8rZanCeSePQQH0NSL3QqiilT2WEt7nCAMvHwR9fT/LE/k6NBMDHqoK3zqzemr4OlQro0YWBeRJ501EawWan/k/rq2VSGTeLO09CsQD6AFHECtxF9+sSKyJxK1aiu7VhmOZLY6L9VKrlpvahQ1/vHVyYVpFJvc3bdHE8D94bBXkZ18mnXj++ST+j1Had4aki7oqTT83fgs7asRg3DRRZArw8PiKVmZWJ4ODRWR/LNvjIxb1FQqWk9I6S3DEo6AMuBRbXgj1H4YWrRuTkWlEpP2Y/P5+Mvfv5GbNQKYSKwpTYFOCTn13yQ1wtDbF4yG+Ro4Xf45cNBT6k3yqswrKt9bkP2wiULqYZR7McaD1SJ4whFFqcadjpLvbn8zQNFY0lOUTQMGI",
		expected: {
			miiName: "ミク",
			firstName: "ミク",
			lastName: "はつね",
			islandName: "LOSTの",
		},
	},
];

// 372 bytes of zeroes.
const zeroes372 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// 32 bytes of zeroes (too short to be a Mii QR code).
const length32 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

// Mii QR code encrypted correctly but has an invalid CRC-16 checksum.
const badCrc = "ULENrXILeXZooDaJvwHMcFaBjGH7k5pj+DDPDV0irq66c01Fh82TIrZerZX2xiB+TbHBzYIaDHdryA9IbR1uH/slSalGCScmjDiL9zpOXlvh8z38NGkmjtL1fVVrshCcJHKeQApdbZU4S6h+wZd0LA==";

// Hair dye should be applied to hair only.
const hairDyeHairOnly = "lHDnfRgqe2+drU303Slkj7+o4JldrKcIdOl5zgLM0LpwQKQY+i3cpt5IIg7LBNAr7TCzHOvi698oUV0QkcyNj71MgtAAaw4MvOdT4dsv0PLof6E7IcjgnCA1ZAJ2Bs5PQTnM/yuVBUIXdq6WYh+nmG3HtxV7zKbEpSy4bqVep8uuvUlfZcB+BQgucPXQLmDnS8ECKwOlANcKTI+ZjIZggVaEsyY88pjRWyXnwe1z4Favw16bIzecesehGlqXzZh9U5Vm5dZP8wmKc3G6TGylYmbnloRd99UYRNULvTQCUer8WljGuV30ftXlJOwfsnwoAiVOGoG3KvbsBpPtPLywR5DavRgQIPd0/b+XUzHQDhkyftMXeqVEalsuEmU/b/1/j4yVL+2lWgD1i2xyET65uJawAnd8jbKbG8lxPMgzIKGVqJB4QmJOl9/dTf21r9GgRFRaFEz+66bVfiYhzXKmJUQv2qx/t/V3r96QzYd08nrWSHK0";
const hairDyeHairOnlyExpectedCommonColor = 99; // Must apply to hair but not eyebrow and beard.
// Hair dye should be applied to hair, eyebrow, and beard.
const hairDyeHairEyebrowBeard = validQrCodes[1].base64; // Miku has hair dye.
const hairDyeHairEyebrowBeardExpectedCommonColor = 67; // Must apply to hair, eyebrow, and beard.

// Should not have hair dye enabled.
const hairDyeMode0 = validQrCodes[0].base64; // Frieren doesn't have hair dye

function base64ToUint8Array(base64: string): Uint8Array {
	const binary = Buffer.from(base64, "base64");
	return new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength);
}

describe("convertQrCode", () => {
	it.each(validQrCodes.map((t, i) => [i, t]))(
		"should convert valid QR #%i into Mii + TomodachiLifeMii",
		(_, { base64, expected }) => {
			const bytes = base64ToUint8Array(base64);
			const { mii, tomodachiLifeMii } = convertQrCode(bytes);

			expect(mii).toBeInstanceOf(Mii);
			expect(tomodachiLifeMii).toBeInstanceOf(TomodachiLifeMii);

			expect(mii.miiName).toBe(expected.miiName);
			expect(tomodachiLifeMii.firstName).toBe(expected.firstName);
			expect(tomodachiLifeMii.lastName).toBe(expected.lastName);
			expect(tomodachiLifeMii.islandName).toBe(expected.islandName);
		});

	it("should throw an error on zeroed out data", () => {
		const bytes = base64ToUint8Array(zeroes372);
		// Will decrypt wrongly, leading to the expected stream
		// of zeroes in the decrypted data not being intact.
		expect(() => convertQrCode(bytes)).toThrow("QR code is not a valid Mii QR code");
	});

	it("should throw an error on wrong length", () => {
		const bytes = base64ToUint8Array(length32);
		// Thrown at the beginning of the function.
		expect(() => convertQrCode(bytes)).toThrow("Mii QR code has wrong size (got 32, expected 112 or longer)");
	});

	it("should throw an error on data with bad CRC-16", () => {
		const bytes = base64ToUint8Array(badCrc);
		// Verified by new Mii() constructor from mii-js.
		expect(() => convertQrCode(bytes)).toThrow("Mii data is not valid");
	});

	it("should apply hair dye to hair, eyebrow, and beard", () => {
		const bytes = base64ToUint8Array(hairDyeHairEyebrowBeard);
		const { mii, tomodachiLifeMii } = convertQrCode(bytes);

		expect(tomodachiLifeMii.hairDyeMode).toBe(HairDyeMode.HairEyebrowBeard);
		expect(tomodachiLifeMii.studioHairColor).toBe(hairDyeHairEyebrowBeardExpectedCommonColor);
		expect(mii.hairColor).toBe(hairDyeHairEyebrowBeardExpectedCommonColor);
		expect(mii.eyebrowColor).toBe(hairDyeHairEyebrowBeardExpectedCommonColor);
		expect(mii.facialHairColor).toBe(hairDyeHairEyebrowBeardExpectedCommonColor);
	});

	it("should apply hair dye to hair only", () => {
		const bytes = base64ToUint8Array(hairDyeHairOnly);
		const { mii, tomodachiLifeMii } = convertQrCode(bytes);

		expect(tomodachiLifeMii.hairDyeMode).toBe(HairDyeMode.Hair);
		expect(tomodachiLifeMii.studioHairColor).toBe(hairDyeHairOnlyExpectedCommonColor);
		expect(mii.hairColor).toBe(hairDyeHairOnlyExpectedCommonColor);
		expect(mii.eyebrowColor === hairDyeHairOnlyExpectedCommonColor).toBe(false);
		expect(mii.facialHairColor === hairDyeHairOnlyExpectedCommonColor).toBe(false);
	});

	it("should not apply hair dye if mode is 0", () => {
		const bytes = base64ToUint8Array(hairDyeMode0);
		const { mii, tomodachiLifeMii } = convertQrCode(bytes);

		expect(tomodachiLifeMii.hairDyeMode).toBe(HairDyeMode.None);
		expect(mii.hairColor === tomodachiLifeMii.studioHairColor).toBe(false);
		expect(mii.hairColor === mii.facialHairColor).toBe(false);
	});

	/*
	it('should censor bad words in names', () => {
		const qrWithSwears = // TODO TODO
		const { tomodachiLifeMii } = convertQrCode(qrWithSwears);
		expect(tomodachiLifeMii.firstName).not.toMatch(/INSERT_SWEARS_HERE/i);
	});
  */
});
