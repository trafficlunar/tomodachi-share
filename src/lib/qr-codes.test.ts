import { convertQrCode } from "./qr-codes";
import { describe, it, expect } from "vitest";
import Mii from "./mii.js/mii";
import TomodachiLifeMii from "./tomodachi-life-mii";

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

const zeroes372 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const length32 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

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
		expect(() => convertQrCode(bytes)).toThrow("QR code is not a valid Mii QR code");
	});

	it("should throw an error on wrong length", () => {
		const bytes = base64ToUint8Array(length32);
		expect(() => convertQrCode(bytes)).toThrow("Mii data is not valid");
	});
	/*
  it('should censor bad words in names', () => {
    const qrWithSwears = // TODO TODO
    const { tomodachiLifeMii } = convertQrCode(qrWithSwears);

    expect(tomodachiLifeMii.firstName).not.toMatch(/INSERT_SWEARS_HERE/i);
  });
  */
});
